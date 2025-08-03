"use client";

import "react-native-get-random-values";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import AddressHandler from "../../components/PaymentComponents/AddressHandler";
import PaymentMethods from "../../components/PaymentComponents/PaymentMethods";
import OrderSummary from "../../components/PaymentComponents/OrderSummary";
import orderService from "../../config/axios/Order/orderService";
import profileService from "../../config/axios/Home/AccountProfile/profileService";

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Vui lòng nhập họ và tên"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Vui lòng nhập số điện thoại"),
  addressId: Yup.string().required("Vui lòng chọn địa chỉ giao hàng"),
  paymentMethod: Yup.string().required("Vui lòng chọn phương thức thanh toán"),
});

const Payment = ({ route, navigation }) => {
  const { cartItems: passedCartItems } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [addresses, setAddresses] = useState([]);
  const [isOrderCreated, setIsOrderCreated] = useState(false);

  const generateOrderId = () => {
    try {
      return `ORDER${uuidv4().replace(/-/g, "").slice(0, 12)}`;
    } catch (error) {
      return `ORDER${Date.now().toString().slice(-12)}`;
    }
  };

  const [orderId] = useState(generateOrderId());
  const formikRef = useRef(null);
  const cartItems = passedCartItems?.length > 0 ? passedCartItems : [];

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const validateOrderPayload = (payload) => {
    const errors = [];

    if (!payload.order.userId || !isValidObjectId(payload.order.userId)) {
      errors.push(`Invalid userId: ${payload.order.userId}`);
    }

    if (
      !payload.order.deliveryAddressId ||
      !isValidObjectId(payload.order.deliveryAddressId)
    ) {
      errors.push(
        `Invalid deliveryAddressId: ${payload.order.deliveryAddressId}`
      );
    }

    if (
      !payload.order.newOrderId ||
      typeof payload.order.newOrderId !== "string"
    ) {
      errors.push(`Invalid newOrderId: ${payload.order.newOrderId}`);
    }

    payload.order.cartItems.forEach((item, index) => {
      if (!item.productId || !isValidObjectId(item.productId)) {
        errors.push(`Invalid productId at index ${index}: ${item.productId}`);
      }

      if (
        !item.quantity ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        errors.push(`Invalid quantity at index ${index}: ${item.quantity}`);
      }

      if (!item.price || typeof item.price !== "number" || item.price <= 0) {
        errors.push(`Invalid price at index ${index}: ${item.price}`);
      }
    });

    const numericFields = ["subtotal", "discount", "total", "pointUsed"];
    numericFields.forEach((field) => {
      if (typeof payload.order[field] !== "number") {
        errors.push(
          `Invalid ${field}: ${payload.order[field]} (type: ${typeof payload
            .order[field]})`
        );
      }
    });

    const stringFields = ["paymentMethod", "paymentStatus", "note"];
    stringFields.forEach((field) => {
      if (typeof payload.order[field] !== "string") {
        errors.push(
          `Invalid ${field}: ${payload.order[field]} (type: ${typeof payload
            .order[field]})`
        );
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const userInfo = await AsyncStorage.getItem("userInfo");
        let parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

        if (
          !parsedUserInfo ||
          !parsedUserInfo.accountId ||
          !isValidObjectId(parsedUserInfo.accountId)
        ) {
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data.account) {
            parsedUserInfo = {
              accountId: profileResponse.data.account._id,
              fullName: profileResponse.data.account.fullName,
              phone: profileResponse.data.account.phoneNumber,
            };
            await AsyncStorage.setItem(
              "userInfo",
              JSON.stringify(parsedUserInfo)
            );
          } else {
            setNotification({
              message:
                profileResponse.message ||
                "Không thể tải thông tin người dùng.",
              type: "error",
            });
            return;
          }
        }

        if (!isValidObjectId(parsedUserInfo.accountId)) {
          setNotification({
            message: "ID tài khoản không hợp lệ.",
            type: "error",
          });
          return;
        }

        if (formikRef.current) {
          formikRef.current.setValues({
            ...formikRef.current.values,
            fullName: parsedUserInfo.fullName || "",
            phone: parsedUserInfo.phone || "",
          });
        }

        const addressResponse = await profileService.getDeliveryAddresses();
        if (addressResponse.success) {
          const validAddresses = addressResponse.data.filter((addr) =>
            isValidObjectId(addr._id)
          );
          setAddresses(validAddresses);
          const defaultAddress = validAddresses.find((addr) => addr.isDefault);
          if (defaultAddress && formikRef.current) {
            formikRef.current.setFieldValue("addressId", defaultAddress._id);
          }
        } else {
          setNotification({
            message:
              addressResponse.message || "Không thể tải địa chỉ giao hàng.",
            type: "error",
          });
        }
      } catch (error) {
        setNotification({
          message: "Lỗi hệ thống. Vui lòng thử lại.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const processPayment = async (values) => {
    try {
      if (!values.addressId || !isValidObjectId(values.addressId)) {
        setNotification({
          message: "Vui lòng chọn một địa chỉ giao hàng hợp lệ.",
          type: "error",
        });
        return;
      }

      const selectedAddress = addresses.find(
        (addr) => addr._id === values.addressId
      );
      if (!selectedAddress) {
        setNotification({
          message: "Địa chỉ giao hàng không hợp lệ.",
          type: "error",
        });
        return;
      }

      const userInfo = await AsyncStorage.getItem("userInfo");
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
      if (
        !parsedUserInfo?.accountId ||
        !isValidObjectId(parsedUserInfo.accountId)
      ) {
        setNotification({
          message:
            "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.",
          type: "error",
        });
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        setNotification({
          message: "Giỏ hàng trống. Vui lòng thêm sản phẩm.",
          type: "error",
        });
        return;
      }

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const itemName =
          item.name || item.title || item.productName || `Sản phẩm #${i + 1}`;
        const productId = item._id || item.id;
        const productPrice = item.salePrice || item.price;

        if (!productId || !isValidObjectId(productId)) {
          setNotification({
            message: `ID sản phẩm không hợp lệ: ${itemName} (ID: ${
              productId || "không có"
            })`,
            type: "error",
          });
          return;
        }

        if (!productPrice || typeof productPrice !== "number") {
          setNotification({
            message: `Giá sản phẩm không hợp lệ: ${itemName} (Giá: ${productPrice})`,
            type: "error",
          });
          return;
        }
      }

      const subtotal = cartItems.reduce((total, item) => {
        const price = item.salePrice || item.price || 0;
        const quantity = item.quantity || 1;
        return total + price * quantity;
      }, 0);
      const totalAmount = subtotal;

      const orderPayload = {
        order: {
          newOrderId: String(orderId),
          userId: String(parsedUserInfo.accountId),
          deliveryAddressId: String(values.addressId),
          cartItems: cartItems.map((item) => {
            const productId = item._id || item.id;
            const price = item.salePrice || item.price;
            const quantity = item.quantity || 1;
            return {
              productId: String(productId),
              quantity: Number(quantity),
              price: Number(price),
            };
          }),
          subtotal: Number(subtotal),
          discount: Number(0),
          shippingFee: Number(0),
          total: Number(totalAmount),
          paymentMethod: String(values.paymentMethod),
          paymentStatus: String(
            values.paymentMethod === "cod" ? "Pending" : "Paid"
          ),
          note: String(values.note || ""),
          pointUsed: Number(0),
        },
      };

      const validation = validateOrderPayload(orderPayload);
      if (!validation.valid) {
        setNotification({
          message: `Dữ liệu đơn hàng không hợp lệ: ${validation.errors.join(
            ", "
          )}`,
          type: "error",
        });
        return;
      }

      const orderResponse = await orderService.createOrder(orderPayload);
      let paymentLink = "";
      if (!orderResponse.success) {
        setNotification({
          message: orderResponse.message || "Không thể tạo đơn hàng.",
          type: "error",
        });
        return;
      } else {
        const metaData = {
          returnUrl: "",
          cancelUrl: "",
        };
        paymentResponse = await orderService.getPaymentLinkForOrder(
          orderResponse.data.newOrderId,
          metaData
        );
        if (paymentResponse) {
          paymentLink = paymentResponse.data.paymentLink;
        }
      }

      const orderData = {
        cartItems: cartItems.map((item) => ({
          productId: item._id || item.id,
          title: item.name || item.title || item.productName || "Sản phẩm",
          quantity: item.quantity || 1,
          price: item.salePrice || item.price,
        })),
        subtotal,
        discount: 0,
        shippingFee: 0,
        total: totalAmount,
        pointUsed: 0,
        note: values.note || "",
      };

      if (values.paymentMethod === "bank") {
        const paymentData = {
          orderCode: orderResponse.data.newOrderId || orderId,
          paymentLink: paymentLink,
          amount: totalAmount,
          currency: "VND",
          paymentMethod: values.paymentMethod,
          description: "Chuyển khoản ngân hàng",
          transactionDateTime: new Date().toISOString(),
        };

        navigation.navigate("QRPaymentScreen", {
          paymentData,
          orderData,
        });
        return;
      }

      const paymentPayload = {
        orderId: orderResponse.data.orderId || orderId,
        amount: totalAmount,
        currency: "VND",
        paymentMethod: values.paymentMethod,
        description:
          values.paymentMethod === "cod"
            ? "Thanh toán khi nhận hàng (COD)"
            : "Chuyển khoản ngân hàng",
        transactionDateTime: new Date().toISOString(),
      };

      const confirmResponse = await orderService.confirmPayment(paymentPayload);

      if (confirmResponse.success) {
        navigation.navigate("ConfirmPaymentScreen", {
          paymentData: { ...confirmResponse.data, orderData },
        });
      } else {
        setNotification({
          message: confirmResponse.message || "Không thể xác nhận thanh toán.",
          type: "error",
        });
      }
    } catch (error) {
      setNotification({
        message: `Lỗi xử lý thanh toán: ${error.message}`,
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.summaryText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {notification.message ? (
        <View
          style={[
            styles.notification,
            notification.type === "error"
              ? styles.errorNotification
              : styles.successNotification,
          ]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>Thanh toán đơn hàng</Text>
      <Formik
        innerRef={formikRef}
        initialValues={{
          fullName: "",
          phone: "",
          addressId: "",
          note: "",
          paymentMethod: "cod",
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setIsLoading(true);
          processPayment(values).finally(() => {
            setIsLoading(false);
            setSubmitting(false);
          });
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
              <AddressHandler
                navigation={navigation}
                formikRef={formikRef}
                setNotification={setNotification}
                setAddresses={setAddresses}
              />
              {touched.addressId && errors.addressId && (
                <Text style={styles.errorText}>{errors.addressId}</Text>
              )}
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={values.fullName}
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
              {touched.fullName && errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={values.phone}
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={values.note}
                onChangeText={handleChange("note")}
                onBlur={handleBlur("note")}
                placeholder="Ghi chú (nếu có)"
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
              <Text style={styles.label}>Phương thức thanh toán</Text>
              <PaymentMethods formikRef={formikRef} />
              {touched.paymentMethod && errors.paymentMethod && (
                <Text style={styles.errorText}>{errors.paymentMethod}</Text>
              )}
            </View>
            <OrderSummary
              cartItems={cartItems}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              addressId={values.addressId}
              paymentMethod={values.paymentMethod}
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  formContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#212121",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginBottom: 8,
  },
  notification: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorNotification: {
    backgroundColor: "#ffebee",
    borderColor: "#E53935",
    borderWidth: 1,
  },
  successNotification: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
  },
  summaryText: {
    fontSize: 16,
    color: "#424242",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 8,
  },
});

export default Payment;

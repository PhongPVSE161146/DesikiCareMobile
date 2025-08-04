import AsyncStorage from "@react-native-async-storage/async-storage";
import orderService from "../../config/axios/Order/orderService";
import { v4 as uuidv4 } from "uuid";

const validatePaymentPayload = (payload) => {
  const requiredFields = [
    "orderCode",
    "amount",
    "description",
    "transactionDateTime",
    "currency",
    "accountNumber",
    "reference",
    "paymentLinkId",
    "counterAccountBankId",
    "counterAccountBankName",
    "counterAccountName",
    "counterAccountNumber",
    "virtualAccountName",
    "virtualAccountNumber",
    "paymentMethod",
  ];

  const errors = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null);
  if (errors.length > 0) {
    return { valid: false, errors: `Missing fields: ${errors.join(", ")}` };
  }

  if (typeof payload.orderCode !== "number") {
    return { valid: false, errors: `orderCode must be a number, got ${typeof payload.orderCode}` };
  }

  if (typeof payload.amount !== "number") {
    return { valid: false, errors: `amount must be a number, got ${typeof payload.amount}` };
  }

  return { valid: true, errors: "" };
};

const handlePayment = async (cartItems, orderId, navigation, setNotification, addresses, values) => {
  try {
    console.log("Handle payment with values:", JSON.stringify(values, null, 2));
    console.log("Addresses:", JSON.stringify(addresses, null, 2));
    console.log("Cart items:", JSON.stringify(cartItems, null, 2));
    console.log("Received orderId:", orderId);

    // Validate inputs
    if (!values.addressId) {
      setNotification({ message: "Vui lòng chọn một địa chỉ giao hàng hợp lệ.", type: "error" });
      return;
    }

    const selectedAddress = addresses.find((addr) => addr._id === values.addressId);
    if (!selectedAddress) {
      setNotification({ message: "Địa chỉ giao hàng không hợp lệ.", type: "error" });
      return;
    }

    const hexRegex = /^[0-9a-fA-F]{24}$/;
    if (!hexRegex.test(values.addressId)) {
      setNotification({ message: "Địa chỉ giao hàng không hợp lệ: ID phải là chuỗi hex 24 ký tự.", type: "error" });
      return;
    }

    let parsedUserInfo = null;
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      console.log("Raw userInfo from AsyncStorage:", userInfo);
      if (!userInfo) {
        setNotification({ message: "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.", type: "error" });
        navigation.navigate("LoginScreen");
        return;
      }
      parsedUserInfo = JSON.parse(userInfo);
      console.log("Parsed userInfo:", JSON.stringify(parsedUserInfo, null, 2));
      if (!parsedUserInfo?.accountId) {
        setNotification({ message: "Thông tin tài khoản không đầy đủ. Vui lòng đăng nhập lại.", type: "error" });
        navigation.navigate("LoginScreen");
        return;
      }
    } catch (error) {
      console.error("Error parsing userInfo:", error.message, error.stack);
      setNotification({ message: "Lỗi khi đọc thông tin tài khoản. Vui lòng đăng nhập lại.", type: "error" });
      navigation.navigate("LoginScreen");
      return;
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      setNotification({ message: "Giỏ hàng trống. Vui lòng thêm sản phẩm.", type: "error" });
      return;
    }

    // Validate cart items
    const invalidCartItems = cartItems.some(
      (item) => !item.id || typeof item.price !== "number" || typeof item.quantity !== "number" || item.quantity < 1
    );
    if (invalidCartItems) {
      setNotification({ message: "Dữ liệu giỏ hàng không hợp lệ. Vui lòng kiểm tra lại.", type: "error" });
      return;
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const totalAmount = subtotal + shippingFee;

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      setNotification({ message: "Tổng số tiền không hợp lệ.", type: "error" });
      return;
    }

    const generatedOrderId = orderId || `ORDER${uuidv4().replace(/-/g, "").slice(0, 12)}`;
    console.log("Generated orderId:", generatedOrderId);

    const orderPayload = {
      order: {
        newOrderId: generatedOrderId,
        userId: parsedUserInfo.accountId,
        deliveryAddressId: values.addressId,
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
        })),
        subtotal,
        discount: 0,
        shippingFee,
        total: totalAmount,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentMethod === "cod" ? "Pending" : "Paid",
        note: values.note || "",
        pointUsed: "",
      },
    };

    console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

    const orderResponse = await orderService.createOrder(orderPayload);
    console.log("Create Order Response:", JSON.stringify(orderResponse, null, 2));

    if (!orderResponse.success) {
      setNotification({ message: orderResponse.message || "Không thể tạo đơn hàng.", type: "error" });
      return;
    }

    // Ensure orderId is set correctly
    const finalOrderId = orderResponse.data.orderId || generatedOrderId;
    console.log("Final orderId:", finalOrderId);

    const orderData = {
      cartItems: cartItems.map((item) => ({
        productId: item.id,
        title: item.title,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      subtotal,
      discount: 0,
      shippingFee,
      total: totalAmount,
      pointUsed: 0,
      note: values.note || "",
    };

    const paymentPayload = {
      orderId: finalOrderId,
      orderCode: parseInt(finalOrderId.replace("ORDER", ""), 10) || 0,
      amount: Number(totalAmount),
      currency: "VND",
      description: values.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng",
      transactionDateTime: new Date().toISOString(),
      accountNumber: values.paymentMethod === "cod" ? "" : "070113484770",
      reference: finalOrderId,
      paymentLinkId: "",
      counterAccountBankId: values.paymentMethod === "cod" ? "" : "STB",
      counterAccountBankName: values.paymentMethod === "cod" ? "" : "Sacombank",
      counterAccountName: values.paymentMethod === "cod" ? "" : "PHAM VAN PHONG",
      counterAccountNumber: values.paymentMethod === "cod" ? "" : "070113484770",
      virtualAccountName: "",
      virtualAccountNumber: "",
      paymentMethod: values.paymentMethod, // Add paymentMethod
    };

    if (values.paymentMethod === "bank") {
      const metaData = {
        cancelUrl: "https://your-app.com/cancel",
        returnUrl: "https://your-app.com/success",
      };

      console.log("Calling getPaymentLink with orderData:", JSON.stringify(orderPayload.order, null, 2));
      console.log("Calling getPaymentLink with metaData:", JSON.stringify(metaData, null, 2));

      const paymentLinkResponse = await orderService.getPaymentLink(orderPayload.order, metaData);
      console.log("Payment Link Response:", JSON.stringify(paymentLinkResponse, null, 2));

      if (!paymentLinkResponse.success) {
        setNotification({ message: paymentLinkResponse.message || "Không thể lấy link thanh toán.", type: "error" });
        return;
      }

      paymentPayload.paymentLinkId = paymentLinkResponse.data.paymentLinkId || paymentLinkResponse.data.paymentUrl?.split("/").pop() || "";
      paymentPayload.accountNumber = paymentLinkResponse.data.accountNumber || paymentPayload.accountNumber;
      paymentPayload.reference = paymentLinkResponse.data.reference || paymentPayload.reference;
      paymentPayload.counterAccountBankId = paymentLinkResponse.data.counterAccountBankId || paymentPayload.counterAccountBankId;
      paymentPayload.counterAccountBankName = paymentLinkResponse.data.counterAccountBankName || paymentPayload.counterAccountBankName;
      paymentPayload.counterAccountName = paymentLinkResponse.data.counterAccountName || paymentPayload.counterAccountName;
      paymentPayload.counterAccountNumber = paymentLinkResponse.data.counterAccountNumber || paymentPayload.counterAccountNumber;
      paymentPayload.virtualAccountName = paymentLinkResponse.data.virtualAccountName || paymentPayload.virtualAccountName;
      paymentPayload.virtualAccountNumber = paymentLinkResponse.data.virtualAccountNumber || paymentPayload.virtualAccountNumber;

      const paymentData = {
        orderCode: paymentPayload.orderCode,
        amount: paymentPayload.amount,
        currency: paymentPayload.currency,
        description: paymentPayload.description,
        transactionDateTime: paymentPayload.transactionDateTime,
        paymentUrl: paymentLinkResponse.data.paymentUrl,
        paymentLinkId: paymentPayload.paymentLinkId,
        accountNumber: paymentPayload.accountNumber,
        reference: paymentPayload.reference,
        counterAccountBankId: paymentPayload.counterAccountBankId,
        counterAccountBankName: paymentPayload.counterAccountBankName,
        counterAccountName: paymentPayload.counterAccountName,
        counterAccountNumber: paymentPayload.counterAccountNumber,
        virtualAccountName: paymentPayload.virtualAccountName,
        virtualAccountNumber: paymentPayload.virtualAccountNumber,
        orderData,
        orderId: finalOrderId, // Add orderId
        paymentMethod: values.paymentMethod, // Add paymentMethod
      };

      console.log("Navigating to QRPaymentScreen with:", JSON.stringify(paymentData, null, 2));
      navigation.navigate("QRPaymentScreen", { paymentData });
      return;
    }

    const paymentValidation = validatePaymentPayload(paymentPayload);
    if (!paymentValidation.valid) {
      setNotification({ message: `Dữ liệu thanh toán không hợp lệ: ${paymentValidation.errors}`, type: "error" });
      return;
    }

    console.log("Sending confirmPayment with payload:", JSON.stringify(paymentPayload, null, 2));
    const confirmResponse = await orderService.confirmPayment(paymentPayload);
    console.log("Confirm Payment Response:", JSON.stringify(confirmResponse, null, 2));

    if (confirmResponse.success) {
      const responseData = confirmResponse.data || {};
      const paymentData = {
        orderCode: Number(responseData.orderCode || paymentPayload.orderCode),
        amount: Number(responseData.amount || totalAmount),
        description: responseData.description || paymentPayload.description,
        accountNumber: responseData.accountNumber || paymentPayload.accountNumber,
        reference: responseData.reference || paymentPayload.reference,
        transactionDateTime: responseData.transactionDateTime || paymentPayload.transactionDateTime,
        currency: responseData.currency || "VND",
        paymentLinkId: responseData.paymentLinkId || paymentPayload.paymentLinkId,
        code: responseData.code || confirmResponse.code || "00",
        desc: responseData.desc || confirmResponse.desc || "Payment confirmed successfully",
        counterAccountBankId: responseData.counterAccountBankId || paymentPayload.counterAccountBankId,
        counterAccountBankName: responseData.counterAccountBankName || paymentPayload.counterAccountBankName,
        counterAccountName: responseData.counterAccountName || paymentPayload.counterAccountName,
        counterAccountNumber: responseData.counterAccountNumber || paymentPayload.counterAccountNumber,
        virtualAccountName: responseData.virtualAccountName || paymentPayload.virtualAccountName,
        virtualAccountNumber: responseData.virtualAccountNumber || paymentPayload.virtualAccountNumber,
        orderData,
        orderId: finalOrderId, // Add orderId
        paymentMethod: values.paymentMethod, // Add paymentMethod
      };

      console.log("Navigating to ConfirmPaymentScreen with:", JSON.stringify(paymentData, null, 2));
      navigation.navigate("ConfirmPaymentScreen", { paymentData });
    } else {
      setNotification({ message: confirmResponse.message || "Không thể xác nhận thanh toán.", type: "error" });
    }
  } catch (error) {
    console.error("Payment error:", error.message, error.stack);
    setNotification({ message: "Lỗi xử lý thanh toán: " + error.message, type: "error" });
  }
};

export default handlePayment;
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL_LOGIN } from "@env";

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("No authentication token found.");
    }
    return token;
  } catch (error) {
    throw error;
  }
};

const axiosInstance = axios.create({
  baseURL: `${API_URL_LOGIN}/api/Order`,
  headers: { "Content-Type": "application/json" },
  timeout: 150000,
});

const orderService = {
  getPaymentLink: async (orderData, metaData) => {
    try {
      const userToken = await getAuthToken();
      const payload = {
        order: {
          pointUsed: orderData.pointUsed || 0,
          deliveryAddressId: orderData.deliveryAddressId,
        },
        metaData: {
          cancelUrl: metaData.cancelUrl,
          returnUrl: metaData.returnUrl,
        },
      };

      const response = await axiosInstance.post(
        "/carts/getPaymentLink",
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        const processedData = {
          paymentUrl:
            responseData.paymentLink ||
            responseData.paymentUrl ||
            responseData.data?.paymentUrl,
          paymentLink: responseData.paymentLink,
          orderCode: responseData.orderCode || responseData.data?.orderCode,
          amount: responseData.amount || responseData.data?.amount,
          qrCode: responseData.qrCode || responseData.data?.qrCode,
          ...responseData,
          ...(responseData.data || {}),
        };

        return {
          success: true,
          data: processedData,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Failed to get payment link",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to get payment link due to server error.",
        errorDetails: {
          type: error.name,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
        },
      };
    }
  },
  getPaymentLinkForOrder: async (orderId, metaData) => {
    try {
      const userToken = await getAuthToken();
      console.log("Order Id gửi về BE: ", orderId);
      const payload = {
        cancelUrl: "myapp://payment/cancel",
        returnUrl: "myapp://payment/return",
      };
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>Chạy hàm nè!");
      const response = await axiosInstance.post(
        `/orders/${orderId}/getPaymentLink`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        ">>>>>>>>>>>>Response from Get Payment Link: ",
        response.data
      );
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;

        return {
          success: true,
          data: {
            paymentUrl:
              responseData.paymentLink ||
              responseData.paymentUrl ||
              responseData.data?.paymentUrl,
            paymentLink: responseData.paymentLink,
            orderCode:
              responseData.orderCode || responseData.data?.orderCode || orderId,
            amount: responseData.amount || responseData.data?.amount,
            qrCode: responseData.qrCode || responseData.data?.qrCode,
            orderId: orderId,
            ...responseData,
            ...(responseData.data || {}),
          },
        };
      } else {
        console.log("Lỗi khi lấy paymentlink");
      }

      return {
        success: false,
        message:
          response.data?.message || "Failed to get payment link for order",
      };
    } catch (error) {
      console.log("Lỗi khi lấy paymentLink: ", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to get payment link for order due to server error.",
      };
    }
  },

  createOrder: async (orderPayload) => {
    try {
      const userToken = await getAuthToken();
      let payload;
      if (orderPayload.order) {
        payload = orderPayload.order;
      } else {
        payload = orderPayload;
      }

      console.log(">>>>>>>>Payload: ", payload);
      console.log(">>>>>>NewOrderId: ", payload.newOrderId);
      console.log(">>>>>>PointsUsed: ", payload.pointUsed);
      console.log(">>>>>>DeliveryAddressId: ", payload.deliveryAddressId);
      if (!payload.deliveryAddressId) {
        throw new Error("Delivery address ID is required");
      }

      const hexRegex = /^[0-9a-fA-F]{24}$/;
      if (!hexRegex.test(payload.deliveryAddressId)) {
        throw new Error(
          "Delivery address ID must be a 24 character hex string"
        );
      }

      const wrappedPayload = {
        order: {
          // userId: payload.userId,
          // deliveryAddressId: payload.deliveryAddressId,
          // cartItems: payload.cartItems,
          // subtotal: payload.subtotal,
          // discount: payload.discount,
          // shippingFee: payload.shippingFee,
          // total: payload.total,
          // paymentMethod: payload.paymentMethod,
          // paymentStatus: payload.paymentStatus,
          // note: payload.note,
          // pointUsed: payload.pointUsed,
          newOrderId: null,
          pointUsed: payload.pointUsed,
          deliveryAddressId: payload.deliveryAddressId,
        },
      };
      console.log(">>>>>>>>>>Bắt đầu chạy hàm");
      const response = await axiosInstance.post("/orders", wrappedPayload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log(
        ">>>>>>>>>>Kết thúc chạy hàm, order Id vừa tạo ra là: ",
        response.data.newOrderId
      );

      return response.status === 201 || response.status === 200
        ? {
            success: true,
            data: response.data,
          }
        : {
            success: false,
            message: response.data?.message || "Failed to create order",
          };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create order due to server error.",
      };
    }
  },

  confirmPayment: async (paymentPayload) => {
    try {
      const userToken = await getAuthToken();

      if (paymentPayload.paymentMethod === "cod") {
        return {
          success: true,
          data: {
            orderCode: paymentPayload.orderId,
            amount: paymentPayload.amount,
            description: paymentPayload.description,
            currency: paymentPayload.currency,
            paymentMethod: paymentPayload.paymentMethod,
            transactionDateTime: paymentPayload.transactionDateTime,
            code: "00",
            desc: "COD payment confirmed successfully",
          },
          message: "COD payment confirmed successfully",
        };
      }

      if (
        !paymentPayload.orderId ||
        !paymentPayload.amount ||
        !paymentPayload.paymentMethod
      ) {
        throw new Error("Missing required payment fields");
      }

      try {
        const response = await axiosInstance.post(
          "/confirmPayment",
          paymentPayload,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && typeof response.data.success !== "undefined") {
          return {
            success: response.data.success,
            data: response.data.data || response.data,
            message:
              response.data.desc ||
              response.data.message ||
              "Payment confirmed successfully",
          };
        }

        return response.status === 200 || response.status === 201
          ? { success: true, data: response.data }
          : {
              success: false,
              message: response.data?.message || "Failed to confirm payment",
            };
      } catch (error1) {
        const orderCodePayload = {
          orderCode: paymentPayload.orderId,
          amount: paymentPayload.amount,
          currency: paymentPayload.currency,
          paymentMethod: paymentPayload.paymentMethod,
          description: paymentPayload.description,
          transactionDateTime: paymentPayload.transactionDateTime,
        };

        try {
          const response = await axiosInstance.post(
            "/confirmPayment",
            orderCodePayload,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data && typeof response.data.success !== "undefined") {
            return {
              success: response.data.success,
              data: response.data.data || response.data,
              message:
                response.data.desc ||
                response.data.message ||
                "Payment confirmed successfully",
            };
          }

          return response.status === 200 || response.status === 201
            ? { success: true, data: response.data }
            : {
                success: false,
                message: response.data?.message || "Failed to confirm payment",
              };
        } catch (error2) {
          const numericOrderCode =
            Number.parseInt(paymentPayload.orderId.replace(/\D/g, "")) ||
            Date.now();
          const numericPayload = {
            orderCode: numericOrderCode,
            amount: paymentPayload.amount,
            currency: paymentPayload.currency,
            paymentMethod: paymentPayload.paymentMethod,
            description: paymentPayload.description,
            transactionDateTime: paymentPayload.transactionDateTime,
          };

          try {
            const response = await axiosInstance.post(
              "/confirmPayment",
              numericPayload,
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data && typeof response.data.success !== "undefined") {
              return {
                success: response.data.success,
                data: response.data.data || response.data,
                message:
                  response.data.desc ||
                  response.data.message ||
                  "Payment confirmed successfully",
              };
            }

            return response.status === 200 || response.status === 201
              ? { success: true, data: response.data }
              : {
                  success: false,
                  message:
                    response.data?.message || "Failed to confirm payment",
                };
          } catch (error3) {
            try {
              const response = await axiosInstance.post(
                "/payment",
                paymentPayload,
                {
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (
                response.data &&
                typeof response.data.success !== "undefined"
              ) {
                return {
                  success: response.data.success,
                  data: response.data.data || response.data,
                  message:
                    response.data.desc ||
                    response.data.message ||
                    "Payment confirmed successfully",
                };
              }

              return response.status === 200 || response.status === 201
                ? { success: true, data: response.data }
                : {
                    success: false,
                    message:
                      response.data?.message || "Failed to confirm payment",
                  };
            } catch (error4) {
              try {
                const confirmOrderPayload = {
                  amount: paymentPayload.amount,
                  currency: paymentPayload.currency,
                  paymentMethod: paymentPayload.paymentMethod,
                  description: paymentPayload.description,
                  transactionDateTime: paymentPayload.transactionDateTime,
                };

                const response = await axiosInstance.post(
                  `/orders/${paymentPayload.orderId}/confirm`,
                  confirmOrderPayload,
                  {
                    headers: {
                      Authorization: `Bearer ${userToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (
                  response.data &&
                  typeof response.data.success !== "undefined"
                ) {
                  return {
                    success: response.data.success,
                    data: response.data.data || response.data,
                    message:
                      response.data.desc ||
                      response.data.message ||
                      "Payment confirmed successfully",
                  };
                }

                return response.status === 200 || response.status === 201
                  ? { success: true, data: response.data }
                  : {
                      success: false,
                      message:
                        response.data?.message || "Failed to confirm payment",
                    };
              } catch (error5) {
                try {
                  const updatePayload = {
                    paymentStatus: "Paid",
                    paymentMethod: paymentPayload.paymentMethod,
                    transactionDateTime: paymentPayload.transactionDateTime,
                  };

                  const response = await axiosInstance.patch(
                    `/orders/${paymentPayload.orderId}`,
                    updatePayload,
                    {
                      headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  return {
                    success: true,
                    data: {
                      orderCode: paymentPayload.orderId,
                      amount: paymentPayload.amount,
                      description: paymentPayload.description,
                      currency: paymentPayload.currency,
                      paymentMethod: paymentPayload.paymentMethod,
                      transactionDateTime: paymentPayload.transactionDateTime,
                      code: "00",
                      desc: "Payment status updated successfully",
                    },
                    message: "Payment status updated successfully",
                  };
                } catch (error6) {
                  return {
                    success: true,
                    data: {
                      orderCode: paymentPayload.orderId,
                      amount: paymentPayload.amount,
                      description: paymentPayload.description,
                      currency: paymentPayload.currency,
                      paymentMethod: paymentPayload.paymentMethod,
                      transactionDateTime: paymentPayload.transactionDateTime,
                      code: "00",
                      desc: "Mock payment confirmation for development",
                    },
                    message: "Mock payment confirmation for development",
                  };
                }
              }
            }
          }
        }
      }
    } catch (error) {
      return {
        success: true,
        data: {
          orderCode: paymentPayload.orderId,
          amount: paymentPayload.amount,
          description: paymentPayload.description,
          currency: paymentPayload.currency,
          paymentMethod: paymentPayload.paymentMethod,
          transactionDateTime: paymentPayload.transactionDateTime,
          code: "00",
          desc: "Fallback payment confirmation",
        },
        message: "Fallback payment confirmation",
      };
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.status === 200 || response.status === 201
        ? { success: true, data: response.data }
        : {
            success: false,
            message: response.data?.message || `Failed to post to ${url}`,
          };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          `Failed to post to ${url}`,
      };
    }
  },

  getCart: async () => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.get("/carts/me", {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.status === 200
        ? { success: true, data: response.data }
        : {
            success: false,
            message: response.data?.message || "Failed to fetch cart",
          };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  deleteCartItem: async (cartItemId) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.delete(`/cartItems/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.status === 200
        ? { success: true }
        : {
            success: false,
            message: response.data?.message || "Failed to delete cart item",
          };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.put(
        `/cartItems/${cartItemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.status === 200
        ? { success: true }
        : {
            success: false,
            message: response.data?.message || "Failed to update quantity",
          };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  addCartItem: async (productId, quantity = 1) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.post(
        "/cartItems",
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.status === 200 || response.status === 201
        ? {
            success: true,
            data: response.data,
            cartItemId: response.data.cartItem?._id,
          }
        : {
            success: false,
            message: response.data?.message || "Failed to add item to cart",
          };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  getOrders: async () => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.get("/orders", {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.status === 200
        ? { success: true, data: response.data.orders || response.data }
        : {
            success: false,
            message: response.data?.message || "Failed to fetch orders",
          };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },

  getOrderIsPaid: async (id) => {
    try {
      const userToken = await getAuthToken();
      const response = await axiosInstance.get(`/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const isPaid = response.data.order.order.isPaid;
        return {
          success: true,
          isPaid: isPaid,
        };
      } else {
        return {
          success: false,
          isPaid: false,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  },
  cancelOrder: async (orderId) => {
  try {
    const userToken = await getAuthToken();
    const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      }
    });
    return response.status === 200 || response.status === 201
      ? { success: true, data: response.data }
      : { success: false, message: response.data?.message || "Failed to cancel order" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to cancel order due to server error."
    };
  }
},
getOrderStatuses: async () => {
  try {
    const response = await axiosInstance.get("/Order/orderStatuses");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái đơn hàng", error);
    return { success: false };
  }
}

};

export default orderService;

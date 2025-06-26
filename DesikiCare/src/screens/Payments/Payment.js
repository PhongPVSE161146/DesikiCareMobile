import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Card, Input } from 'react-native-elements';
import RadioGroup from 'react-native-radio-buttons-group';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Vui lòng nhập họ và tên'),
  phone: Yup.string().required('Vui lòng nhập số điện thoại'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán'),
});

// Radio button options
const radioButtonsData = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    value: 'cod',
    selected: true,
  },
  {
    id: 'bank',
    label: 'Chuyển khoản ngân hàng',
    value: 'bank',
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    value: 'momo',
  },
];

const Payment = () => {
  const handleSubmit = (values) => {
    console.log('Thông tin thanh toán:', values);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn hàng</Text>

      <Formik
        initialValues={{
          fullName: '',
          phone: '',
          address: '',
          note: '',
          paymentMethod: 'cod',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            {/* Delivery Information */}
            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>Thông tin giao hàng</Text>

              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                errorMessage={touched.fullName && errors.fullName}
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                errorMessage={touched.phone && errors.phone}
                keyboardType="phone-pad"
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <Input
                label="Địa chỉ giao hàng"
                placeholder="Nhập địa chỉ"
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                errorMessage={touched.address && errors.address}
                containerStyle={styles.input}
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
              />

              <View style={styles.textAreaContainer}>
                <Text style={[styles.label, styles.inputLabel]}>Ghi chú</Text>
                <TextInput
                  placeholder="Ghi chú (nếu có)"
                  value={values.note}
                  onChangeText={handleChange('note')}
                  onBlur={handleBlur('note')}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
              </View>

              <View style={styles.radioContainer}>
                <Text style={[styles.label, styles.inputLabel]}>
                  Phương thức thanh toán
                </Text>
                <RadioGroup
                  radioButtons={radioButtonsData}
                  onPress={(data) => {
                    const selected = data.find((item) => item.selected);
                    if (selected) {
                      setFieldValue('paymentMethod', selected.value);
                    }
                  }}
                  layout="column"
                  containerStyle={styles.radioGroup}
                />
                {touched.paymentMethod && errors.paymentMethod && (
                  <Text style={styles.errorText}>{errors.paymentMethod}</Text>
                )}
              </View>
            </Card>

            {/* Order Summary */}
            <Card containerStyle={styles.card}>
              <Text style={styles.cardTitle}>Tóm tắt đơn hàng</Text>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryText}>Sản phẩm A</Text>
                <Text style={styles.summaryText}>150.000₫</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryText}>Phí giao hàng</Text>
                <Text style={styles.summaryText}>30.000₫</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalText}>Tổng cộng:</Text>
                <Text style={styles.summaryTotalText}>180.000₫</Text>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7', // From .payment-container
    padding: 16, // Adjusted for mobile (50px 80px is too large)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24, // 2rem
    color: '#333',
  },
  formContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 12, // From .ant-card
    marginBottom: 24,
    padding: 16,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS (from box-shadow)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500', // From .ant-form-item-label
    color: '#333',
    marginBottom: 8,
  },
  inputText: {
    fontSize: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8, // From .ant-input
    paddingHorizontal: 8,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8, // From .ant-input
    padding: 8,
    fontSize: 16,
    height: 80,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioGroup: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // From .summary-item
    paddingVertical: 6, // 6px 0
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15, // From .summary-item
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0', // From .summary-total border-top
    marginVertical: 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between', // From .summary-total
    paddingTop: 10, // 10px
  },
  summaryTotalText: {
    fontSize: 17, // From .summary-total
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#f06292', // From .ant-btn-primary
    borderRadius: 8, // 8px
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
    height: 45, // 45px
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600', // From .ant-btn-primary
  },
});

export default Payment;
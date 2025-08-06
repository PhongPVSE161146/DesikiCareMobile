import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import quizService from '../../config/axios/Home/Quiz/quizService';

const QuizScreen = () => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const result = await quizService.getQuizQuestions();
        if (result.success && Array.isArray(result.data)) {
          setQuizQuestions(result.data);
          setError(null);
        } else {
          setError(result.message || 'Không thể tải câu hỏi.');
        }
      } catch (err) {
        setError('Lỗi không xác định. Vui lòng thử lại.');
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchQuiz();
  }, []);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setError(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }, 300);
    }
  };

  const handleSubmit = async () => {
    const quizOptionIds = Object.values(selectedOptions);
    if (quizOptionIds.length !== quizQuestions.length) {
      const unansweredIndex = quizQuestions.findIndex(
        (q) => !selectedOptions[q.quizQuestion._id]
      );
      setError('Vui lòng chọn đáp án cho tất cả các câu hỏi.');
      setCurrentQuestionIndex(unansweredIndex);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await quizService.submitQuizResult(quizOptionIds);
      if (result.success && result.data) {
        setResults(result.data);
        setError(null);
      } else {
        setError(result.message || 'Không thể gửi kết quả.');
      }
    } catch (err) {
      setError('Lỗi gửi kết quả. Vui lòng thử lại.');
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleProductPress = (product) => {
    // Truyền productId thay vì toàn bộ object product
    navigation.navigate('ProductDetail', { productId: product.product._id });
  };

  const renderQuestion = () => {
    const item = quizQuestions[currentQuestionIndex];
    if (!item || !item.quizQuestion || !item.quizOptions) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dữ liệu câu hỏi không hợp lệ.</Text>
        </View>
      );
    }
    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionText}>
          Câu {currentQuestionIndex + 1}: {item.quizQuestion.content}
        </Text>
        {item.quizOptions.map((option, optIndex) => (
          <TouchableOpacity
            key={optIndex}
            style={[
              styles.optionButton,
              selectedOptions[item.quizQuestion._id] === option.quizOption._id &&
                styles.selectedOption,
              !selectedOptions[item.quizQuestion._id] && error && styles.unansweredOption,
            ]}
            onPress={() => handleOptionSelect(item.quizQuestion._id, option.quizOption._id)}
          >
            <Text style={styles.optionText}>{option.quizOption.content}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  const renderResults = () => {
    if (!results) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có kết quả để hiển thị.</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Kết quả Quiz</Text>
        <Text style={styles.resultsSection}>Loại da:</Text>
        {results.skinTypes && results.skinTypes.length > 0 ? (
          results.skinTypes.map((type, index) => (
            <Text key={index} style={styles.resultItem}>- {type.name}</Text>
          ))
        ) : (
          <Text style={styles.resultItem}>- Không có thông tin loại da</Text>
        )}
        <Text style={styles.resultsSection}>Tình trạng da:</Text>
        {results.skinStatuses && results.skinStatuses.length > 0 ? (
          results.skinStatuses.map((status, index) => (
            <Text key={index} style={styles.resultItem}>- {status.name}</Text>
          ))
        ) : (
          <Text style={styles.resultItem}>- Không có thông tin tình trạng da</Text>
        )}
        <Text style={styles.resultsSection}>Sản phẩm đề xuất:</Text>
        {results.recommendedProducts && results.recommendedProducts.length > 0 ? (
          results.recommendedProducts.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productContainer}
              onPress={() => handleProductPress(product)}
            >
              <Text style={styles.productName}>{product.product?.name || 'Không có tên'}</Text>
              <Text style={styles.productDetail}>
                Danh mục: {product.category?.name || 'Không có danh mục'}
              </Text>
              <Text style={styles.productDetail}>
                Giá: {product.product?.salePrice ? `${product.product.salePrice} VNĐ` : 'N/A'}
              </Text>
              <Text style={styles.productDetail}>
                Mô tả: {product.product?.description || 'Không có mô tả'}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.resultItem}>- Không có sản phẩm đề xuất</Text>
        )}
      </ScrollView>
    );
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(selectedOptions).length;
    const totalQuestions = quizQuestions.length;
    return totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fa7ca6" />
          <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : results ? (
        renderResults()
      ) : quizQuestions.length > 0 ? (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Câu {currentQuestionIndex + 1} / {quizQuestions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {getProgressPercentage()}% hoàn thành
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {renderQuestion()}
          </ScrollView>
          <View style={styles.navigationContainer}>
            <Button
              title="Trước"
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
              color="#fa7ca6"
            />
            <Button
              title={currentQuestionIndex === quizQuestions.length - 1 ? 'Gửi kết quả' : 'Tiếp'}
              onPress={currentQuestionIndex === quizQuestions.length - 1 ? handleSubmit : handleNext}
              disabled={submitting}
              color="#fa7ca6"
            />
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có câu hỏi nào.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 20,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fa7ca6',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#fa7ca6',
    borderColor: '#fa7ca6',
  },
  unansweredOption: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultsSection: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  resultItem: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  productContainer: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default QuizScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Button, ScrollView } from 'react-native';
import quizService from '../../config/axios/Home/Quiz/quizService';

const QuizScreen = () => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const result = await quizService.getQuizQuestions();
        if (result.success) {
          setQuizQuestions(result.data);
          setError(null);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Lỗi không xác định. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    const quizOptionIds = Object.values(selectedOptions);
    if (quizOptionIds.length !== quizQuestions.length) {
      setError('Vui lòng chọn đáp án cho tất cả các câu hỏi.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await quizService.submitQuizResult(quizOptionIds);
      if (result.success) {
        setResults(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Lỗi gửi kết quả. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{item.quizQuestion.content}</Text>
      {item.quizOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOptions[item.quizQuestion._id] === option.quizOption._id && styles.selectedOption,
          ]}
          onPress={() => handleOptionSelect(item.quizQuestion._id, option.quizOption._id)}
        >
          <Text style={styles.optionText}>- {option.quizOption.content}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Kết quả Quiz</Text>
      <Text style={styles.resultsSection}>Loại da:</Text>
      {results.skinTypes.map((type, index) => (
        <Text key={index} style={styles.resultItem}>- {type.name}</Text>
      ))}
      <Text style={styles.resultsSection}>Tình trạng da:</Text>
      {results.skinStatuses.map((status, index) => (
        <Text key={index} style={styles.resultItem}>- {status.name}</Text>
      ))}
      <Text style={styles.resultsSection}>Sản phẩm đề xuất:</Text>
      {results.recommendedProducts.map((product, index) => (
        <View key={index} style={styles.productContainer}>
          <Text style={styles.productName}>{product.product.name}</Text>
          <Text style={styles.productDetail}>Danh mục: {product.category.name}</Text>
          <Text style={styles.productDetail}>Giá: {product.product.salePrice} VNĐ</Text>
          <Text style={styles.productDetail}>Mô tả: {product.product.description}</Text>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fa7ca6" />
          <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : results ? (
        renderResults()
      ) : (
        <>
          <FlatList
            data={quizQuestions}
            renderItem={renderQuestion}
            keyExtractor={(item) => item.quizQuestion._id}
            contentContainerStyle={styles.flatListContainer}
          />
          <Button
            title={submitting ? 'Đang gửi...' : 'Gửi kết quả'}
            onPress={handleSubmit}
            disabled={submitting}
            color="#fa7ca6"
            backgroundColor="#fa7ca6"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#fa7ca6',
    borderColor: '#fa7ca6',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultsSection: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  resultItem: {
    fontSize: 16,
    marginLeft: 10,
  },
  productContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetail: {
    fontSize: 14,
    color: '#555',
  },
});

export default QuizScreen;
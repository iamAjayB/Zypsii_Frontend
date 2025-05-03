import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';
import { useNavigation } from '@react-navigation/native';

function FAQ() {
  const navigation = useNavigation();

  const faqData = [
    {
      category: 'Booking & Reservations',
      questions: [
        {
          question: 'How do I book a trip?',
          answer: 'You can book a trip by selecting your destination, dates, and travel preferences in our app. Follow the booking wizard to complete your reservation.'
        },
        {
          question: 'Can I modify my booking?',
          answer: 'Yes, you can modify your booking up to 48 hours before your trip. Go to "My Trips" and select the booking you wish to modify.'
        }
      ]
    },
    {
      category: 'Payment & Refunds',
      questions: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept all major credit cards, debit cards, and digital payment methods like PayPal and Apple Pay.'
        },
        {
          question: 'What is your cancellation policy?',
          answer: 'You can cancel your booking up to 24 hours before the trip for a full refund. Cancellations within 24 hours may be subject to a fee.'
        }
      ]
    },
    {
      category: 'Travel & Safety',
      questions: [
        {
          question: 'What safety measures are in place?',
          answer: 'We follow all local health guidelines and ensure our partners maintain high safety standards. All vehicles are regularly sanitized.'
        },
        {
          question: 'Do I need travel insurance?',
          answer: 'While not mandatory, we strongly recommend purchasing travel insurance for international trips to cover unexpected situations.'
        }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* Breadcrumbs */}
      <View style={styles.breadcrumbs}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.breadcrumbText}>Profile</Text>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={16} color={colors.fontThirdColor} />
        <Text style={[styles.breadcrumbText, styles.activeBreadcrumb]}>FAQ</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        
        {faqData.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.questions.map((item, qIndex) => (
              <View key={qIndex} style={styles.questionContainer}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  breadcrumbText: {
    color: colors.fontThirdColor,
    fontSize: 14,
  },
  activeBreadcrumb: {
    color: colors.Zypsii_color,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.Zypsii_color,
    marginBottom: 15,
  },
  questionContainer: {
    backgroundColor: colors.grayBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: colors.fontSecondColor,
    lineHeight: 20,
  },
});

export default FAQ; 
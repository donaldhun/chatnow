import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export function ChatBubble({ message, isUser }) {
  return (
    <View style={{ backgroundColor: isUser ? 'rgb(104, 94, 199)' : 'rgb(75, 66, 156)', borderRadius: 10, width: '100%', flexDirection: isUser ? 'row' : 'row-reverse', padding: 10, minHeight: 80, paddingBottom: 20, marginBottom: 10 }}>
      {isUser && <FontAwesome name="user-circle" size={36} color="black" />}
      <View style={{ backgroundColor: isUser ? 'rgb(104, 94, 199)' : 'rgb(75, 66, 156)', width: '85%', marginLeft: isUser ? 10 : 0 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 5 }}>{isUser ? "User" : "Assistant"}</Text>
        <Text style={{ fontSize: 15 }}>{message}</Text>
      </View>
    </View>
  );
}

type ChatMessage = {
  message: string;
  isUser: boolean;
}

export default function TabOneScreen() {

  const API_KEY = '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';
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [formattedChatMessages, setFormattedChatMessages] = useState<{ role: string, content: string }[]>([]);

  const [chatTitle, setChatTitle] = useState('');

  const scrollViewRef = useRef();

  const [messageCount, setMessageCount] = useState(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }, 100); // Adjust the delay time as needed
  };


  const updateChatTitle = async () => {
    const newChatMessages = [...chatMessages, { message: inputValue, isUser: true }];
    setChatMessages(newChatMessages);

    const newFormattedChatMessages = [...formattedChatMessages, { role: "system", content: "Given all the messages in this chat so far, please respond with how you would title this conversation. Be very concise, using less than 5 words." }];

    setInputValue('');

    try {
      const messages = newFormattedChatMessages;

      console.log("==RESPONSE BODY==" + JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 250 }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          // max_tokens: 250,
        }),
      });

      // ... handle the response
      const data = await response.json();

      console.log("==TITLE==" + data.choices[0].message.content);
      const assistantResponse = data.choices[0].message.content;
      setChatTitle(assistantResponse);
      //  MakeResponseChatBubble(assistantResponse);
      //  scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {

      console.log(messageCount);
      
      scrollToBottom();
      const newChatMessages = [...chatMessages, { message: inputValue, isUser: true }];
      setChatMessages(newChatMessages);
      
      const newFormattedChatMessages = [...formattedChatMessages, { role: "user", content: inputValue }];
      setFormattedChatMessages(newFormattedChatMessages);
      
      setInputValue('');
      
      try {
        const messages = newFormattedChatMessages;
        
          <Feather name="send" size={24} color="white" onPress={handleSendMessage} />
        console.log("==RESPONSE BODY==" + JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 250 }));
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            // max_tokens: 250,
          }),
        });
        
        // ... handle the response
        const data = await response.json();
        console.log("==FULL DATA==" + (data));
        if (!data || !data.choices) {
          console.log('Invalid response', data);
          return;
        }
        console.log("==RESPONSE TEXT==" + data.choices[0].message.content);
        const assistantResponse = data.choices[0].message.content;
        MakeResponseChatBubble(assistantResponse);
        scrollToBottom();
      } catch (error) {
        console.error('Error:', error);
      }
      // Update chat title if necessary
      setMessageCount(prevCount => prevCount + 1);
      if (messageCount == 2) {
        console.log("making new title...");
        updateChatTitle();
      }
    }
  };
  
  const MakeResponseChatBubble = (response) => {
    setChatMessages((prevState) => [
      ...prevState,
      { message: response, isUser: false },
    ]);
    setFormattedChatMessages((prevState) => [
      ...prevState,
      { role: "assistant", content: response },
    ]);
    const formattedMessage = JSON.stringify({ role: "assistant", content: response });
  };

  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{ width: '100%', height: 65, backgroundColor: 'rgb(55, 48, 120)', borderBottomWidth: 1, borderColor: 'rgb(50, 43, 108)', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingHorizontal:25, flexDirection:'row', }}
      >
        <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenModal}>
          <FontAwesome name="bars" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chatTitle || 'New Chat'}</Text>
      </View>
        
        <Text style={{ fontSize: 18, alignSelf:'center' }}>{chatTitle || 'New Chat'}</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          {/* Your modal content */}
        </View>
      </Modal>
      
      <ScrollView
        style={styles.ChatsContainer}
        ref={scrollViewRef}
      >
        {chatMessages.map((chat, index) => (
          <ChatBubble key={index} message={chat.message} isUser={chat.isUser} />
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.InputContainer}
      >
        <View style={styles.InputBox}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Type here..."
            autoFocus
            returnKeyType='send'
            onSubmitEditing={handleSendMessage}
          />
          <Feather name="send" size={24} color="white" onPress={handleSendMessage} />
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgb(55, 48, 120)',
  },
  ChatsContainer: {
    backgroundColor: 'rgb(55, 48, 120)',
    flex: 1, // Take up available space
    width: '100%',
    alignContent: 'center',
    padding: 10,
  },
  InputContainer: {
    backgroundColor: 'rgb(55, 48, 120)',
    width: '100%',
    padding: 10,
  },
  InputBox: {
    backgroundColor: 'rgb(104, 94, 199)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    color: 'white',
    flex: 1,
    height: Platform.OS === 'ios' ? 50 : 50, // Adjust height to your preference
    marginLeft: 10, // Add some margin for the input field
  },
});

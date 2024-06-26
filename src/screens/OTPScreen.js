import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const OTPScreen = () => {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const navigation = useNavigation();
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    console.log('Confirmation code submitted:', code);
  };

    return ( 
        <View style={styles.container}>

        <TouchableOpacity style={styles.backButton}>
            <Text>{'<'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Your Password</Text>

        <Image source={require('../assets/password-reset-icon.png')} style={styles.icon} />

        <View style={styles.lockIcon}>
            {/* Insert lock icon here */}
        </View>

        <Text style={styles.instructionText}>
            Enter the confirmation code sent to {'\n'}demo@123.gmail.com
        </Text>

        <TextInput
            style={styles.codeInput}
            onChangeText={setCode}
            value={code}
            keyboardType="number-pad"
            maxLength={6}
        // The number of character boxes will depend on the confirmation code length
        />

        <TouchableOpacity style={styles.submitButton} onPress={()=>navigation.navigate('ResetPasswordScreen')}>
            <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.newCodeButton}>
            <Text style={styles.newCodeButtonText}>request a new code in 02:42</Text>
        </TouchableOpacity> */}

      <TouchableOpacity style={styles.newCodeButton} onPress={() => {
        // Handle request new code here
        console.log('Requesting new code');
      }}>
        <Text style={styles.newCodeButtonText}>
          {countdown > 0 ? `Request a new code in ${formatTime(countdown)}` : 'Request a new code'}
        </Text>
      </TouchableOpacity>

      <View style={styles.indicatorContainer}>
        {/* Add indicator dots here */}
      </View>
      <View style={styles.paginationContainer}>
        <View style={styles.paginationDotInactive} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDotInactive} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    marginLeft: 20,
    marginTop: 40,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  lockIcon: {
    // Style for the lock icon
  },
  instructionText: {
    marginVertical: 10,
    textAlign: 'center',
  },
  icon: {
    // Add styles for your icon here
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 15,
    width: '80%',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
  },
  newCodeButton: {
    margin: 20,
  },
  newCodeButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  indicatorContainer: {
    // Style for the indicator dots
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  paginationDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#0000ff',
    marginHorizontal: 5,
  },
  paginationDotInactive: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
    marginHorizontal: 5,
  },
});

export default OTPScreen;

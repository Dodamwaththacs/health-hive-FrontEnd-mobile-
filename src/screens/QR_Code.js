import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from 'react-native-qrcode-svg';

const QR_Code = ({ route }) => {
  const { userId } = route.params;
  console.log('userId:', userId);

  return (
    <View style={styles.container}>
      <Text style={styles.textHeader}>Your QR Code</Text>
      {userId && (
        <QRCode
          value={userId.toString()}
          size={200}
          color="black"
          backgroundColor="white"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fcff"
  },
  textHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20
  }
});

export default QR_Code;

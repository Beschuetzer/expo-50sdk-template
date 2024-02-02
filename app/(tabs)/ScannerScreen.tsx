import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 20,
    left: "25%",
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  scanAgainText: {
    color: "white",
    fontSize: 18,
  },
});

export default BarcodeScannerScreen;

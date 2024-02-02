import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Button } from "native-base";
import { useRequestCameraPermissions } from "@/components/hooks/useRequestCameraPermissions";
import { COLORS } from "@/constants/Colors";
import { FullscreenSpinner } from "@/components/FullscreenSpinner";

const BarcodeScannerScreen = () => {
  const [type, setType] = useState(CameraType.back);
  const [scanned, setScanned] = useState(false);
  const hasPermission = useRequestCameraPermissions();

  const onSwitchCameraPress = useCallback(() => {
    setType((current) => current === CameraType.back ? CameraType.front : CameraType.back);
  }, [])

  const handleBarCodeScanned = useCallback((scannedObj: any) => {
    const { data } = scannedObj;
    setScanned(true);
    alert(`Bar code '${data}' has been scanned!`);
  }, []);

  if (hasPermission === null) {
    return <FullscreenSpinner />;
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
      <Button onPress={onSwitchCameraPress}>Switch Camera</Button>
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

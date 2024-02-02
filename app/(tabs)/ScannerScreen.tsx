import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Button } from "native-base";
import { useRequestCameraPermissions } from "@/components/hooks/useRequestCameraPermissions";
import { FullscreenSpinner } from "@/components/FullscreenSpinner";
import { useFocusEffect } from "expo-router";

const BarcodeScannerScreen = () => {
  const [type, setType] = useState(CameraType.back);
  const [scanned, setScanned] = useState(false);
  const hasPermission = useRequestCameraPermissions();
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true);

  const onSwitchCameraPress = useCallback(() => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }, []);

  const handleBarCodeScanned = useCallback((scannedObj: any) => {
    const { data } = scannedObj;
    setScanned(true);
    alert(`Bar code '${data}' has been scanned!`);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setShouldRenderCamera(true);
      return () => {
        setScanned(false);
        setShouldRenderCamera(false);
      };
    }, [])
  );

  if (hasPermission === null) {
    return <FullscreenSpinner />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {shouldRenderCamera ? (
        <Camera
          style={styles.camera}
          type={type}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      ) : null}
      {scanned ? (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      ) : null}
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
    top: "50%",
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

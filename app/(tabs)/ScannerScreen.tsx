import { Camera, CameraType } from 'expo-camera'
import { useFocusEffect, useNavigation } from 'expo-router'
import { Button, View, Row, Text } from 'native-base'
import React, { useState, useCallback } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { FullscreenSpinner } from '@/components/FullscreenSpinner'
import { ManualUpcInput } from '@/components/forms/ManualUpcInput'
import { useRequestCameraPermissions } from '@/components/hooks/useRequestCameraPermissions'
import { Routes } from '@/constants/navigation'

const BarcodeScannerScreen = () => {
  const [type, setType] = useState(CameraType.back)
  const [scanned, setScanned] = useState(false)
  const [isManuallyEntering, setIsManuallyEntering] = useState(false)
  const hasPermission = useRequestCameraPermissions()
  const [shouldRenderCamera, setShouldRenderCamera] = useState(true)
  const navigation = useNavigation()

  const handleBarCodeScanned = useCallback((scannedObj: { data: string }) => {
    const { data } = scannedObj
    setScanned(true)
    navigation.navigate(Routes.itemModal, { key: data })
  }, [])

  const onSwitchCameraPress = useCallback(() => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back,
    )
  }, [])

  const onManuallyEnter = useCallback(() => {
    setIsManuallyEntering((current) => !current)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setShouldRenderCamera(true)
      return () => {
        setScanned(false)
        setShouldRenderCamera(false)
      }
    }, []),
  )

  if (hasPermission === null) {
    return <FullscreenSpinner />
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <Row space={1}>
        <Button flex={1} borderRadius={0} onPress={onSwitchCameraPress}>
          Switch Camera
        </Button>
        <Button flex={1} borderRadius={0} onPress={onManuallyEnter}>
          {isManuallyEntering ? 'Close' : 'Enter 13 digit Upc'}
        </Button>
      </Row>
      <ManualUpcInput isVisible={isManuallyEntering} />
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 18,
  },
})

export default BarcodeScannerScreen

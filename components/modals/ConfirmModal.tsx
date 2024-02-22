// ConfirmModal.js

import { View, Text } from 'native-base'
import React, { useCallback } from 'react'
import { Modal, TouchableOpacity } from 'react-native'

export type ConfirmModalProps = {
  isVisible?: boolean
  message?: string
  onConfirm?: () => void
  onCancel?: () => void
}
export const ConfirmModal = (props: ConfirmModalProps) => {
  const { isVisible = false, message = '', onConfirm, onCancel } = props

  const onCancelPress = useCallback(() => {
    onCancel && onCancel()
  }, [onCancel])

  const onConfirmPress = useCallback(() => {
    onConfirm && onConfirm()
  }, [onConfirm])

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onCancelPress}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}
        >
          <Text>{message}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}
          >
            <TouchableOpacity onPress={onConfirmPress}>
              <Text style={{ color: 'green' }}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancelPress}>
              <Text style={{ color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

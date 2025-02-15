import React, { Component } from 'react';
import { View, Text, Image, Alert, Modal, StyleSheet } from 'react-native';
import { CathyRaisedButton, CathyTextButton } from '../../../../shared-components/cathy/CathyButton';

interface NoneMfaConfirmModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onClearAll: () => void;
}

class NoneMfaConfirmModal extends Component<NoneMfaConfirmModalProps> {
  render() {
    const { modalVisible, setModalVisible, onClearAll } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalImageContainer}>
              <Image
                resizeMode="contain"
                style={styles.modalImage}
                source={require("../../../../assets/image/error.png")}
              />
            </View>

            <Text style={styles.modalText}>
              Are you sure you want to clear all selection?
            </Text>
            <Text style={styles.modalSubText}>
              Press cancel to select another option for your MFA Preferences
            </Text>

            <View style={styles.modalButtonContainer}>
              <CathyRaisedButton
                text="Yes"
                onPress={onClearAll}
              />
              <CathyTextButton
                style={styles.cancelButton}
                text="Cancel"
                onPress={() => {
                  setModalVisible(false);
                }}
              ></CathyTextButton>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    height: "50%",
  },
  modalImageContainer: {
    marginBottom: "5%",
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    margin: 10,
  },
  modalText: {
    textAlign: "center",
    fontSize: 20,
  },
  modalSubText: {
    textAlign: "center",
    marginBottom: "10%",
  },
  modalButtonContainer: {
    flex: 1,
  },
  cancelButton: {
    margin: 10,
  },
});

export default NoneMfaConfirmModal;

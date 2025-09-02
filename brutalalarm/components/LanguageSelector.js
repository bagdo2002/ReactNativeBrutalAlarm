import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getAvailableLanguages } from '../i18n';

const LanguageSelector = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode) => {
    try {
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('language')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('done')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languageList}>
          {availableLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                currentLanguage === language.code && styles.languageItemSelected,
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View style={styles.languageItemContent}>
                <Text style={styles.languageItemName}>
                  {language.nativeName}
                </Text>
                <Text style={styles.languageItemSubname}>
                  {language.name}
                </Text>
              </View>
              {currentLanguage === language.code && (
                <Text style={styles.selectedIndicator}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  languageList: {
    flex: 1,
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageItemSelected: {
    backgroundColor: '#e8e8e8',
    borderColor: '#666666',
  },
  languageItemContent: {
    flex: 1,
  },
  languageItemName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 2,
  },
  languageItemSubname: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default LanguageSelector;

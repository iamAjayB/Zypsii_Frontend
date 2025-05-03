import { StyleSheet } from 'react-native';
import { colors } from '../../utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.graycolor,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.blueColor,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.blueColor,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.graycolor,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.graycolor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  profileImagePlaceholderText: {
    fontSize: 16,
    color: colors.graycolor,
  },
  form: {
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.fontMainColor,
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.graycolor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
}); 
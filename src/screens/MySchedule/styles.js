import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../utils';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.Zypsii_color,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.Zypsii_color,
    justifyContent: 'flex-end',
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  inputIcon: {
    padding: 12,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.Zypsii_color,
  },
  removeDayButton: {
    padding: 5,
  },
  mapButton: {
    backgroundColor: colors.Zypsii_color,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  mapButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
  },
  locationList: {
    marginTop: 10,
  },
  locationItem: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: colors.background,
  },
  addDayButtonText: {
    color: colors.Zypsii_color,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: colors.Zypsii_color,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
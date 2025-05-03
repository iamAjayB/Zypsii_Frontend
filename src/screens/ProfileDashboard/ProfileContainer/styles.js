import { StyleSheet } from 'react-native';
import { verticalScale, scale } from '../../../utils/scaling';
import { fontStyles } from '../../../utils/fontStyles';
import { alignment, colors } from '../../../utils';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  maincontainer: {
    ...alignment.Pmedium,
  },
  backgroundCurvedContainer: {
    backgroundColor: colors.btncolor,
    height: 200,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  protractorShape: {
    backgroundColor: colors.white,
    height: 500,
    width: 1000,
    borderTopLeftRadius: 500,
    borderTopRightRadius: 500,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(5),
    paddingHorizontal: scale(5),
    zIndex: 3,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 47, 47, 0.5)',
    
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
    zIndex: 2,
    marginTop: -60
  },
  profileImage: {
    width: verticalScale(100),
    height: verticalScale(100),
    borderRadius: verticalScale(50),
    borderWidth: 5,
    borderColor: colors.greenColor,
  },
  editIcon: {
    position: 'absolute',
    bottom: verticalScale(40),
    right: verticalScale(100),
    backgroundColor: colors.greenColor,
    borderRadius: verticalScale(20),
    padding: scale(5),
  },
  profileName: {
    fontFamily: fontStyles.PoppinsSemiBold,
    fontSize: verticalScale(20),
    marginTop: verticalScale(10),
    color: colors.fontMainColor,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#d3d3d3',
  },
  statLast: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  settingsSection: {
    marginTop: verticalScale(20),
    zIndex: 2,
  },
  settingsItem: {
    backgroundColor: colors.backgroudGray,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: verticalScale(16),
    paddingVertical: verticalScale(16),
    marginBottom: verticalScale(10),
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontFamily: fontStyles.PoppinsRegular,
    fontSize: verticalScale(16),
    marginLeft: scale(10),
    color: colors.fontMainColor,
  },
});

export default styles;

import { StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../utils';
import { colors } from '../../utils';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    overflow: 'visible', // Allow elements to show outside the parent bounds
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
  header: {
    height: 60,
    justifyContent: 'center',
    paddingLeft: 15,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -30,
    zIndex: 2,
  },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    paddingHorizontal: scale(3),
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 5,
    borderColor: '#870E6B',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 20,
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
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 2,
  },
  editProfileButton: {
    backgroundColor: '#870E6B',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#870E6B',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginVertical: -2,
    zIndex: 2,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 3,
    zIndex: 2,
  },
  iconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    
  },
  activeIconBox: {
    borderBottomWidth: 3,
    borderBottomColor: '#870E6B',
  },
  gridContainer: {
    marginTop: 0,
    borderWidth: 0,         // Added white border
    borderColor: '#fff',  
    zIndex: 2, // Set the border color to white
  },
  gridImage: {
    width: 140,
    height: 120,
    margin: 0,
    borderWidth: 1,
    borderColor: "#fff",    // White border for the image grid
  },
  placeholderBox: {
    width: 100,
    height: 100,
    margin: 5,
    backgroundColor: '#d3d3d3',  // Placeholder background
  },
});

export default styles;
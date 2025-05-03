import { StyleSheet } from 'react-native';
import { scale } from '../../utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      backgroundImage: {
        flex: 1,
        justifyContent: 'center', // Center content within the background
        backgroundColor: '#fff',
        
      },
      backgroundImageStyle: {
        resizeMode: 'contain', // Ensures the image fits within the screen boundaries
        width: '100%',
        marginTop: scale(-80)
      },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingLeft: 15,
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
    marginTop: 5,
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
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 3,
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
    borderColor: '#fff',   // Set the border color to white
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
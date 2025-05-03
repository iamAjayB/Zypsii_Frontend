import { StyleSheet, Dimensions } from 'react-native';
import { alignment, colors, scale } from '../../utils';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: scale(100), // Increased padding to ensure content is scrollable past the bottom tab
  },
  imageContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5, // Adjusts to 40% of screen height
    overflow: 'hidden', // Ensures the image respects border radius
  },
  
  detailImage: {
    width: '100%',
    height: '100%', // Makes the image cover the full container
    resizeMode: 'cover', // Ensures the image covers without distortion
  },
  
  detailContainer: {
    backgroundColor: colors.grayBackground,
    borderRadius: 10,
    ...alignment.Pmedium,
    alignSelf: 'flex-start', // Aligns container to the left
    width: '100%',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  detailSubtitle: {
    fontSize: 16,
    color: colors.fontThirdColor,
  },
  icon: {
    marginRight: 5,
  },
  bottomTab: {
    marginTop: 16,
  },
  aboutContainer: {
    ...alignment.MTmedium
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.fontSecondColor,
    lineHeight: 20,
  },
  readMore: {
    color: colors.Zypsii_color, // Set this to your desired link color (e.g., purple or blue)
    fontWeight: 'bold',
  },
  commenttitle:{
    fontSize: 16,
    fontWeight: 'bold',
    ...alignment.MTmedium
  },
  commentContainer: {
    marginTop: 16,
    backgroundColor: colors.grayBackground,
    borderRadius: 10,
    // padding: 16,
    
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...alignment.MTxSmall,
    borderWidth: 2,
    borderColor: colors.grayLinesColor,
    borderRadius: 10,
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: colors.fontMainColor,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.btncolor,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    ...alignment.Psmall
  },
  ratingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...alignment.MLlarge
  },
  
  ratingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontPrimaryColor,
    marginHorizontal: 3,
  },
  
  ratingsCount: {
    fontSize: 14,
    color: colors.fontThirdColor,
  },
  overlayHeader: {
    position: 'absolute',
    top: 50, // Adjust this value to fine-tune the vertical alignment
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2, // Ensures the header is above the image
  },
  
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    borderRadius: 50,
    padding: 8,
  },
  
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    alignSelf: 'center',
  },
  discoverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
    ...alignment.MBmedium,
  },
  discoverText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.btncolor,
    fontWeight: "500",
  },
  card: {
    width: 150,
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    ...alignment.PxSmall,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    borderRadius: 6,
    elevation: 6,
  },
  cardImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },
  cardTitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: colors.fontMainColor,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.fontThirdColor,
  },
  explore: {
    ...alignment.Psmall,
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 16,
  },
  
});

export default styles;

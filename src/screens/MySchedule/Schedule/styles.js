import { StyleSheet } from 'react-native';
import { alignment, colors } from '../../../utils';
import { scale } from '../../../utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    ...alignment.PTsmall,
    zIndex: 2, // Place it above the protractorShape
    position: 'relative', // Adjust from absolute to prevent overlap
    width: '100%',
    ...alignment.Pmedium
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  header: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: scale(14),
    color: colors.btncolor,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightpink,
    borderRadius: scale(20),
    padding: scale(10),
    marginBottom: scale(10),
    ...alignment.MBmedium,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    elevation: 4
  },
  image: {
    width: scale(100),
    height: scale(110),
    borderRadius: scale(25),
    marginRight: scale(10),
    marginTop: 4
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: scale(5),
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: scale(5),
  },
  routeItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  routeLabel: {
    fontSize: scale(12),
    color: '#555',
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: scale(14),
    color: '#555',
    marginTop: scale(5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dash: {
    fontSize: scale(12),
    color: '#555',
    alignSelf: 'center',
  },
  date: {
    fontSize: scale(12),
    color: '#777',
    marginTop: scale(5),
  },
  riders: {
    fontSize: scale(12),
    color: '#777',
    marginTop: scale(5),
  },
  joinedButton: {
    backgroundColor: colors.btncolor,
    borderRadius: scale(30),
    paddingVertical: scale(5),
    paddingHorizontal: scale(15),
    marginTop: scale(90),
  },
  joinedText: {
    color: '#fff',
    fontSize: scale(12),
  },
});

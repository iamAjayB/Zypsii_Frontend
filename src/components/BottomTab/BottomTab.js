import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import styles from './styles';
import { scale, colors } from '../../utils';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function BottomTab({ screen }) {
  const navigation = useNavigation();
 
  const getIconColor = (currentScreen) => {
    return screen === currentScreen ? colors.greenColor : colors.darkGrayText;
  };

  const getTextStyle = (currentScreen) => {
    return screen === currentScreen ? styles.activeText : styles.inactiveText;
  };

  return (
    <View style={styles.footerContainer}>
      {/* Home Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('MainLanding')}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="home"
          size={scale(20)}
          color={getIconColor('HOME')}
        />
        <Text style={getTextStyle('HOME')}>Home</Text>
      </TouchableOpacity>

      {/* Location Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('WhereToGo')}
        style={styles.footerBtnContainer}
      >
        <View style={styles.imgContainer}>
          <SimpleLineIcons
            name="location-pin"
            size={scale(20)}
            color={getIconColor('WhereToGo')}
          />
        </View>
        <Text style={getTextStyle('WhereToGo')}>Where to Go</Text>
      </TouchableOpacity>

    

      {/* Upload Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ReelUpload')}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="hexagon-outline"
          size={scale(20)}
          color={getIconColor('FAVOURITES')}
        />
        <Text style={getTextStyle('FAVOURITES')}>Upload</Text>
      </TouchableOpacity>

  {/* Split/Expense Calculator Icon */}
  <TouchableOpacity
        onPress={() => navigation.navigate('SplitDashboard')}
        style={styles.footerBtnContainer}
      >
        <MaterialIcons
          name="attach-money"
          size={scale(20)}
          color={getIconColor('SPLIT')}
        />
        <Text style={getTextStyle('SPLIT')}>Split</Text>
      </TouchableOpacity>
      
       {/* My Orders Icon */}
       {/* <TouchableOpacity
        onPress={() => navigation.navigate('MessageList')}
        style={styles.footerBtnContainer}
      >
        <FontAwesome5
          name="comment-dots"
          size={scale(20)}
          color={getIconColor('ORDERS')}
        />
        <Text style={getTextStyle('ORDERS')}>Chat</Text>
      </TouchableOpacity> */}

      {/* Profile Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('DummyScreen')}
        style={styles.footerBtnContainer}
      >
        <View style={styles.profileContainer}>
          <MaterialCommunityIcons
            name="menu"
            size={scale(20)}
            color={getIconColor('PROFILE')}
          />
        </View>
        <Text style={getTextStyle('PROFILE')}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BottomTab;

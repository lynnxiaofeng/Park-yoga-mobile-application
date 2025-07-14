import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import HomeLocationRecommendations from '../components/homeLocationRecommendations';
import * as Linking from 'expo-linking';


const HomeScreen = ()=> {
  const router= useRouter();
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/post-it.jpg')} style={styles.image} />
      <Text style={styles.title}>Welcome to Yoga Course app</Text>
      <Text style={styles.subTitle}>Nutrition your mind and body</Text>   
      
      <TouchableOpacity style = {styles.button} onPress={()=> router.push('./course')} >
        <Text style = {styles.buttonText} >Get Started</Text>
      </TouchableOpacity>
      <HomeLocationRecommendations />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    fontWeight:'bold',
  },
  image:{
    width:100,
    height: 100,
    marginBottom:20,
    borderRadius:10,
  },
  title:{
    fontSize:20,
    fontWeight:'bold',
    marginBottom:10,
    color:'#117a65',
  },
  subTitle:{
    fontSize:16,
    marginBottom:10,
    textAlign:'center',
  },
  button:{
    backgroundColor:'#117a65',
    paddingVertical:12,
    paddingHorizontal:25,
    borderRadius:10,
    alignItems:'center',
  },
  buttonText:{
    color:'white',
    fontWeight:'bold',
    fontSize:14,
  },
})

export default HomeScreen;
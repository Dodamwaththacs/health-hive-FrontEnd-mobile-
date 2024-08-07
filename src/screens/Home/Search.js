import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Button,
  Modal,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filemodalVisible, setFileModalVisible] = useState(false);
  const [fileDownloadUri, setFileDownloadUri] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const databaseData = async () => {
      const email = await SecureStore.getItemAsync("userEmail");
      if (searchText !== "") {
        const db = await SQLite.openDatabaseAsync("HealthHive");
        const response = await db.getAllAsync(
          `SELECT * FROM fileStorage WHERE fileName LIKE "%${searchText}%" AND userEmail = "${email}"ORDER BY fileName ASC LIMIT 5 ;`
        );
        db.closeAsync();
        setSearchResults(response);
      } else {
        setSearchResults([]);
      }
    };
    databaseData();
  }, [searchText]);

  const openDocument = (hash) => {
    navigation.navigate("DocumentViewer", { documentUri: hash });
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };
  const temp = () => {
    console.log(searchText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Icon name="search" size={30} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
      </View>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => openDocument(item.hash)}>
              <Text style={styles.name}>{item.fileName}</Text>
              <Text>{item.folderName}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal animationType="slide" visible={filemodalVisible}>
        <Image
          source={{ uri: fileDownloadUri }}
          style={{ width: "50%", height: "50%" }}
        />
        <Button onPress={() => setFileModalVisible(false)} title="Done" />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingBottom: 5,
    paddingTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default SearchBar;

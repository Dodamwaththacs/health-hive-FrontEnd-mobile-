import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import ItemComponent from "./ItemComponents";
import { Ionicons, AntDesign } from "@expo/vector-icons";

const LabFolder = ({ route }) => {
  const { folderName } = route.params;
  const [data, setData] = useState([]);
  const [folderData, setFolderData] = useState([]);
  const [filemodalVisible, setFileModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [fileDownloadUri, setFileDownloadUri] = useState(null);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dropDown, setDropDown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchDataFromOrigin = async () => {
        const email = await SecureStore.getItemAsync("userEmail");
        const userId = await SecureStore.getItemAsync("userId");
        try {
          const response = await axios.get(
            `http://13.202.67.81:10000/usermgtapi/api/files/user/${userId}`
          );
          const originData = response.data;

          const db = await SQLite.openDatabaseAsync("HealthHive");

          for (let i = 0; i < originData.length; i++) {
            console.log(originData[i]);
            try {
              await db.execAsync(
                `INSERT INTO fileStorage (userEmail, fileName, folderName, description, hash) VALUES ('${email}','${originData[i].name}', '${folderName}', ' ', '${originData[i].fileHash}');`
              );
              try {
                await axios.delete(
                  "http://13.202.67.81:10000/usermgtapi/api/files/" +
                    originData[i].id
                );
              } catch (error) {
                console.log("Error data delete : ", error);
                console.log("files :", originData[i].id);
              }

              try {
                await axios.delete(
                  "http://13.202.67.81:10000/usermgtapi/api/labDataUploads/" +
                    originData[i].labDataUploadId
                );
              } catch (error) {
                console.log("Error data delete : ", error);
                console.log("labDataUploads :", originData[i].labDataUploadId);
              }

              try {
                await axios.delete(
                  "http://13.202.67.81:10000/usermgtapi/api/labRequests/" +
                    originData[i].labRequestId
                );
              } catch (error) {
                console.log("Error data delete : ", error);
                console.log("labRequests :", originData[i].labRequestId);
              }
            } catch (error) {
              console.log("Error data insert : ", error);
            }
          }
        } catch (error) {
        } finally {
          fetchDataFromLocal();
        }
      };

      const fetchDataFromLocal = async () => {
        const email = await SecureStore.getItemAsync("userEmail");
        const db = await SQLite.openDatabaseAsync("HealthHive");
        const response = await db.getAllAsync(
          `SELECT * FROM fileStorage WHERE folderName = "${folderName}" AND userEmail = "${email}";`
        );
        setData(response);
        await db.closeAsync();
      };

      fetchDataFromOrigin();

      return () => {};
    }, [folderName, folderModalVisible])
  );

  const handleMove = async () => {
    const email = await SecureStore.getItemAsync("userEmail");

    const db = await SQLite.openDatabaseAsync("HealthHive");
    const response = await db.getAllAsync(`SELECT folderName
        FROM folderData
        WHERE folderName NOT IN ('Lab Reports', '${folderName}') AND userEmail = "${email}"
        ORDER BY folderName ASC;`);
    await db.closeAsync();
    setFolderData(response);
    console.log("folder data :", response);
    setFolderModalVisible(true);

    console.log("inseted data responce :", response);
    setShowCheckboxes(false);
  };

  const alterTable = async (moveFolderName) => {
    console.log("moveFolderName :", moveFolderName);
    const db = await SQLite.openDatabaseAsync("HealthHive");
    try {
      for (let i = 0; i < selectedItems.length; i++) {
        await db.runAsync(
          `UPDATE fileStorage SET folderName = "${moveFolderName}" WHERE id = ${selectedItems[i]} ;`
        );
      }
      alert("Files moved successfully!");
    } catch (error) {
      console.error("Error data update : ", error);
    } finally {
      await db.closeAsync();
      setSelectedItems([]);
      setFolderModalVisible(false);
    }
  };

  const database = async () => {
    const db = await SQLite.openDatabaseAsync("HealthHive");
    const response = await db.getAllAsync(`SELECT folderName
      FROM folderData
      WHERE folderName NOT IN ('Lab Reports', '${folderName}')
      ORDER BY folderName ASC;`);
    console.log("database data :", response);
    await db.closeAsync();
  };

  const handlePress = () => {
    setDropDown(!dropDown);
  };

  const renderItem = ({ item }) => (
    <ItemComponent
      item={item}
      filemodalVisible={filemodalVisible}
      setFileModalVisible={setFileModalVisible}
      fileDownloadUri={fileDownloadUri}
      setFileDownloadUri={setFileDownloadUri}
      showCheckboxes={showCheckboxes}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      dropDown={dropDown}
      setDropDown={setDropDown}
    />
  );

  const renderFolderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => alterTable(item.folderName)}
      >
        <Text style={styles.title}>{item.folderName}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.view}>
      <View style={styles.headContainer}>
        <Text style={styles.head}>{folderName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handlePress()}
        >
          <Ionicons name="ellipsis-horizontal-sharp" size={40} color="#ffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.noticeContainer}>
          <View style={styles.noticeContent}>
            <View style={styles.iconContainer}>
              <AntDesign name="exclamationcircle" size={24} color="#ffffff" />
            </View>
            <Text style={styles.noticeText}>
              Here you can find all the documents related to the lab.
            </Text>
          </View>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        {!showCheckboxes && data.length > 0 && (
          <Button
            title="Move file"
            onPress={() => setShowCheckboxes(!showCheckboxes)}
          />
        )}
        {selectedItems.length > 0 && showCheckboxes && (
          <Button title="done" onPress={handleMove} />
        )}

        <Modal animationType="slide" visible={folderModalVisible} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.moveFolderHeader}>
                <Text>Select folder you want to move</Text>
                <TouchableOpacity>
                  <Icon
                    name="close"
                    size={30}
                    color={"blue"}
                    onPress={() =>
                      setFolderModalVisible(false) && setSelectedItems(null)
                    }
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={folderData}
                renderItem={renderFolderItem}
                keyExtractor={(item) => item.folderName}
              />
            </View>
          </View>
        </Modal>
        {/* <Button title="DB" onPress={database} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0056B3",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  container: {
    flex: 1,
    padding: 10,
  },

  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
  },
  icon: {
    marginRight: 10,
  },
  fileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  head: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  noticeContainer: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noticeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FF3B30",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  moveFolderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // other styles...
  },
  item: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 4, // Add some elevation for a subtle shadow effect
  },
  touchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "30%", // Adjust the height as per your requirement
  },
});

export default LabFolder;

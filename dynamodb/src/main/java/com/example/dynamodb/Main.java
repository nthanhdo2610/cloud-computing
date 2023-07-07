package com.example.dynamodb;

import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeAction;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.AttributeValueUpdate;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;
import software.amazon.awssdk.services.dynamodb.model.ResourceNotFoundException;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

public class Main {

    private static final Logger log = Logger.getLogger(Main.class.getSimpleName());

    public static void main(String[] args) {

        ProfileCredentialsProvider credentialsProvider = ProfileCredentialsProvider.create();
        Region region = Region.US_EAST_1;
        DynamoDbClient ddb = DynamoDbClient.builder()
                .credentialsProvider(credentialsProvider)
                .region(region)
                .build();

        String tableName = "Music";
        String key = "Artist";
        String keyVal = "Famous Band";
        String albumTitle = "AlbumTitle";
        String albumTitleValue = "Songs About Life";
        String awards = "Awards";
        String awardVal = "10";
        String songTitle = "SongTitle";
        String songTitleVal = "Happy Day";

        putItemInTable(ddb, tableName, key, keyVal, albumTitle, albumTitleValue, awards, awardVal, songTitle, songTitleVal);
        getDynamoDBItem(ddb, tableName, key, keyVal, songTitle, songTitleVal);
        updateTableItem(ddb, tableName, key, keyVal, songTitle, songTitleVal, albumTitle, albumTitleValue + " updated!");
        getDynamoDBItem(ddb, tableName, key, keyVal, songTitle, songTitleVal);
        deleteDynamoDBItem(ddb, tableName, key, keyVal, songTitle, songTitleVal);
        System.out.println("\nDone!");
        ddb.close();

    }

    public static void putItemInTable(DynamoDbClient ddb,
                                      String tableName,
                                      String key,
                                      String keyVal,
                                      String albumTitle,
                                      String albumTitleValue,
                                      String awards,
                                      String awardVal,
                                      String songTitle,
                                      String songTitleVal) {

        HashMap<String, AttributeValue> itemValues = new HashMap<>();
        itemValues.put(key, AttributeValue.builder().s(keyVal).build());
        itemValues.put(songTitle, AttributeValue.builder().s(songTitleVal).build());
        itemValues.put(albumTitle, AttributeValue.builder().s(albumTitleValue).build());
        itemValues.put(awards, AttributeValue.builder().s(awardVal).build());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(itemValues)
                .build();

        try {
            PutItemResponse response = ddb.putItem(request);
            log.info("Thanh Do Nguyen added item:");
            printAttributeValue(itemValues);
//            System.out.println(tableName + " was successfully updated. The request id is " + response.responseMetadata().requestId());

        } catch (ResourceNotFoundException e) {
            System.err.format("Error: The Amazon DynamoDB table \"%s\" can't be found.\n", tableName);
            System.err.println("Be sure that it exists and that you've typed its name correctly!");
            System.exit(1);
        } catch (DynamoDbException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    public static void updateTableItem(DynamoDbClient ddb,
                                       String tableName,
                                       String key,
                                       String keyVal,
                                       String songTitle,
                                       String songTitleVal,
                                       String name,
                                       String updateVal) {

        HashMap<String, AttributeValue> keyToGet = new HashMap<>();
        keyToGet.put(key, AttributeValue.builder()
                .s(keyVal)
                .build());
        keyToGet.put(songTitle, AttributeValue.builder()
                .s(songTitleVal)
                .build());

        Map<String, AttributeValueUpdate> updatedValues = new HashMap<>();
        updatedValues.put(name, AttributeValueUpdate.builder()
                .value(AttributeValue.builder().s(updateVal).build())
                .action(AttributeAction.PUT)
                .build());

        UpdateItemRequest request = UpdateItemRequest.builder()
                .tableName(tableName)
                .key(keyToGet)
                .attributeUpdates(updatedValues)
                .build();

        try {
            ddb.updateItem(request);
            log.info("Thanh Do Nguyen updated item:");
            printAttributeValue(keyToGet);
            printAttributeValueUpdate(updatedValues);
        } catch (DynamoDbException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    public static void getDynamoDBItem(DynamoDbClient ddb,
                                       String tableName,
                                       String key,
                                       String keyVal,
                                       String songTitle,
                                       String songTitleVal) {
        HashMap<String, AttributeValue> keyToGet = new HashMap<>();
        keyToGet.put(key, AttributeValue.builder()
                .s(keyVal)
                .build());
        keyToGet.put(songTitle, AttributeValue.builder()
                .s(songTitleVal)
                .build());

        GetItemRequest request = GetItemRequest.builder()
                .key(keyToGet)
                .tableName(tableName)
                .build();

        try {
            // If there is no matching item, GetItem does not return any data.
            Map<String, AttributeValue> returnedItem = ddb.getItem(request).item();
            if (returnedItem.isEmpty())
                System.out.format("No item found with the key %s!\n", key);
            else {
                log.info("Thanh Do Nguyen retrieved item:");
                printAttributeValue(returnedItem);
            }

        } catch (DynamoDbException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    public static void deleteDynamoDBItem(DynamoDbClient ddb,
                                          String tableName,
                                          String key,
                                          String keyVal,
                                          String songTitle,
                                          String songTitleVal) {
        HashMap<String, AttributeValue> keyToGet = new HashMap<>();
        keyToGet.put(key, AttributeValue.builder()
                .s(keyVal)
                .build());
        keyToGet.put(songTitle, AttributeValue.builder()
                .s(songTitleVal)
                .build());

        DeleteItemRequest deleteReq = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(keyToGet)
                .build();

        try {
            ddb.deleteItem(deleteReq);
            log.info("Thanh Do Nguyen deleted item:");
            printAttributeValue(keyToGet);
        } catch (DynamoDbException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }

    public static void printAttributeValue(Map<String, AttributeValue> returnedItem) {
        Set<String> keys = returnedItem.keySet();
        for (String key1 : keys) {
            System.out.format("%s: %s\n", key1, returnedItem.get(key1).s());
        }
    }

    public static void printAttributeValueUpdate(Map<String, AttributeValueUpdate> updatedValues) {
        Set<String> keys = updatedValues.keySet();
        for (String key1 : keys) {
            System.out.format("%s: %s\n", key1, updatedValues.get(key1).value().s());
        }
    }
}

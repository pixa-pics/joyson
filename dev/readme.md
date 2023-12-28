# JoyfulSerial Serialization Library Overview

![](https://raw.githubusercontent.com/pixa-pics/joyson/main/schema.png)
The JoyfulSerial library consists of three main components: `JoyfulSerial`, `DataProcessEngine`, and `ArrayBufferIDManager`. These classes work together to efficiently serialize and deserialize complex data structures, including handling of different types of data and array buffers.

## Interaction Between Classes

- `JoyfulSerial`: This is the primary interface for the serialization and deserialization process. It uses the `DataProcessEngine` to handle the encoding and decoding of various data types. When `JoyfulSerial` encounters a data type or structure that it does not natively understand, such as nested objects, it recursively calls `DataProcessEngine` to process each property's value.

- `DataProcessEngine`: Acts as the central hub for transforming data into a serialized format and vice versa. It uses type detection and custom encoding/decoding strategies to convert data types like numbers, strings, booleans, and more into a serialized string. It also handles complex objects by delegating to `JoyfulSerial` for recursive processing.

- `ArrayBufferIDManager`: This class is responsible for managing array buffers. It keeps track of different and identical array buffers within typed arrays, allowing for efficient memory usage and the ability to share buffers as needed based on user requirements.

## Encoding and Decoding of Data

- Encoding: `JoyfulSerial` takes the input data and checks the type. If it's a basic type, it uses `DataProcessEngine` directly to encode it. For complex or nested objects, `JoyfulSerial` recursively navigates the object's properties, encoding each one using `DataProcessEngine`.

- Decoding: Upon receiving a serialized string, `JoyfulSerial` passes it to `DataProcessEngine` to decode each piece of data back into its original JavaScript objects or primitive types.

## Handling of Errors

To encode an error, `DataProcessEngine` identifies the error type and message. It then serializes this information into a format that includes the error constructor's name and the error message, both encoded in Base64. This allows for accurate reconstruction of the error upon decoding.

## Example of Error Encoding

Here's a step-by-step breakdown of how an error is encoded:

1. Detect the error and its properties (name and message).
2. Convert the name and message into Base64 strings.
3. Concatenate the encoded name and message with a separator (typically a colon ":").
4. Prefix the result with an identifier indicating it's an error type.
5. Serialize the entire structure as a string that can later be decoded back into an error object with the same name and message.

## Conclusion

The `JoyfulSerial` library, with its `DataProcessEngine` and `ArrayBufferIDManager`, provides a comprehensive system for serializing and deserializing complex data structures, efficiently handling various data types, and tracking array buffers. This ensures data integrity and memory efficiency throughout the serialization process.

# Textured-3D-Scene
3D Scene with Textured Object

Description: This is a 3D scene that was rendered using WebGL coding and loads a model. It is a graphic scene that includes vertices, textures and lighting. In this case the model is a “Carpet Barn and Furniture Outlet” which is a brick building that appears to be abandoned. It is filled with graffiti and a very interesting texture overall. The model is retrieved from a http (fetch, async, and request). The model is also rotating around to see all of its sides. The shaders for this project are included in separate files (.glsl). This program also gives users the ability to move around the scene and investigate the model further. 

User Controls: This scene was designed to be moved around in. The camera that is looking into this scene is designed to be moved by the user. The controls are:
-Dolly forward and backwards (“W” and “S”)
-Strafe left and right		  (“A” and “D”)
-Move up and down 		  (“I” and “K”)
-Pan left and right		  (“J” and “L”)
Loading Data: This program is designed to use .jpg and .json to load in and display a file. First, the .json file is extracted and all of its attributes are stored in an object (ModelAttributesArray). This object is further utilized to store all the buffer attributes needed to display the model. 

Key Functions: This program has many functions but several main functions that are able to render the model:
-createModelAttributeArray(): It is responsible for parsing the .json file and filling the object with the correct attributes. 
-InitWebGL(): It fetches the shader programs from the different files, then Compiles and links them. It uses the global object that was created and calls the rest of the functions after. 
-makeShaders(): This creates the shaders for the model, it extracts them dictionary made in the previous function.
-bufferCreator(): Creates the buffers for the model which are: vertex, normal, index and texture buffers. Each of the buffers are stored to the global object. 
-drawModels(): Draw and creates the model in the scene. It is responsible for the matrix operations and the movements that the model follows. It uses the global object to perform everything, making it very dynamic. 

Complications: This project was designed to support three separate objects, each with their own files and sets of data. Unfortunately, I was not able to achieve this. The first object was rendered, and I was able to build any model that I entered in the program. This included the Rust Example model which was very large and detailed. For a reason unknown by me and that troubled me from that start, is that this program would be detrimental to my computer’s performance. After rendering any object that is larger than the Crate example, movement was decreased significantly. I am not sure what caused this but google chrome would freeze and my whole computer would freeze shortly after too. I’d have to force quit all my applications in order to start over and debug. This made it impossible to try to render additional models. 

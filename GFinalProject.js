let obj;
let object;
let ModelMaterialsArray = []; // an array of materials
let ModelAttributeArray = []; // vertices, normals, textcoords, uv


function main(){
    loadExternalJSON('/models/house_02.json');
}

function loadExternalJSON(url) {
    fetch(url)
        .then((resp) => {
            // if the fetch does not result in an network error
            if (resp.ok)
                return resp.json(); // return response as JSON
            throw new Error(`Could not get ${url}`);
        })
        .then(function (ModelInJson) {
            // get a reference to JSON mesh model for debug or other purposes 
            obj = ModelInJson;
            createMaterialsArray(ModelInJson);
            createModelAttributeArray(ModelInJson);
            initWebGL();
        })
        .catch(function (error) {
            // error retrieving resource put up alerts...
            alert(error);
            console.log(error);
        });
}

function createMaterialsArray(obj2){
    console.log('In createMaterialsArray...');
    console.log(obj2.meshes.length);
    // length of the materials array
    // loop through array extracting material properties 
    // needed for rendering
    let itr = obj2.materials.length;
    let idx = 0;

    // each iteration creates a new group or set of attributes for one draw call
    for (idx = 0; idx < itr; idx++) {
        let met = {};
        // shading 
        met.shadingm = obj2.materials[idx].properties[1].value;
        met.ambient = obj2.materials[idx].properties[2].value;
        met.diffuse = obj2.materials[idx].properties[3].value;
        met.specular = obj2.materials[idx].properties[4].value;
        met.shininess = obj2.materials[idx].properties[5].value;

        // object containing all the illumination comp needed to 
        // illuminate faces using material properties for index idx
        ModelMaterialsArray.push(met);
    }
}

function createModelAttributeArray(obj2) {
    // obj.mesh[x] is an array of attributes
    // vertices, normals, texture coord, indices

    // get number of meshes
    console.log('In ModelAttributeArray...');
    let numMeshIndexs = obj2.meshes.length;
    let idx = 0;
    for (idx = 0; idx < numMeshIndexs; idx++) {
        let modelObj = {};

        modelObj.vertices = obj2.meshes[idx].vertices;
        
        modelObj.normals = obj2.meshes[idx].normals;

        // now get index array data from faces, [[x,y,z], [x,y,z], ...]
        // to [x,y,z,x,y,z,...]. use array concat to transform
        modelObj.indexs = [].concat(...obj2.meshes[idx].faces);

        //which material index to use for this set of indices?
        modelObj.matIndex = obj2.meshes[idx].materialindex;


        if (obj2.meshes[idx].texturecoords !== undefined)
            modelObj.textureCoords = obj2.meshes[idx].texturecoords[0];
        else
            console.log(`texture coords for ${idx} does not exist`);


        // push onto array
        ModelAttributeArray.push(modelObj);
    }
    
}


class Camera {
    
    delta = 0.15;

    constructor() {
        this.cameraMatrix = glMatrix.mat4.create();
        this.viewDirectionVector = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
        this.upVector = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        this.sideVector = glMatrix.vec3.fromValues(1.0, 0.0, 0.0);
        this.targetVector = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        this.positionVector = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    }

    moveForward() {
        let deltaForward = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaForward, this.viewDirectionVector, 0.1);
        glMatrix.vec3.add(this.positionVector, this.positionVector, deltaForward);
        this.updateCameraMatrix();
    }
    moveBackward() {
        let deltaForward = glMatrix.vec3.create();
        glMatrix.vec3.scale(deltaForward, this.viewDirectionVector, 0.1);
        glMatrix.vec3.sub(this.positionVector, this.positionVector, deltaForward);
        this.updateCameraMatrix();
    }
    strafeRight() {
        let newAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
        glMatrix.vec3.scale(newAxis, newAxis, this.delta) 
        glMatrix.vec3.add(this.positionVector, this.positionVector, newAxis);
        this.updateCameraMatrix();
    }   
    strafeLeft() {
        let newAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
        glMatrix.vec3.scale(newAxis, newAxis, this.delta) 
        glMatrix.vec3.sub(this.positionVector, this.positionVector, newAxis);
        this.updateCameraMatrix();
    }
    moveUp() {
        let newAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.sideVector);
        glMatrix.vec3.scale(newAxis, newAxis, this.delta)
        glMatrix.vec3.sub(this.positionVector, this.positionVector, newAxis);
        this.updateCameraMatrix();
    }
    moveDown() {
        let newAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.sideVector);
        glMatrix.vec3.scale(newAxis, newAxis, this.delta)
        glMatrix.vec3.add(this.positionVector, this.positionVector, newAxis);
        this.updateCameraMatrix();
    }
    panRight() {
        let rotateAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(rotateAxis, this.viewDirectionVector, this.upVector);
        glMatrix.vec3.rotateY(rotateAxis, rotateAxis, [0.0, 1.0, 0.0], this.delta * Math.PI / 180.0);
        glMatrix.vec3.scale(rotateAxis, rotateAxis, this.delta)
        glMatrix.vec3.add(this.viewDirectionVector, this.viewDirectionVector, rotateAxis);
        
        this.updateCameraMatrix();
    }
    panLeft() {
        let rotateAxis = glMatrix.vec3.create();
        glMatrix.vec3.cross(rotateAxis, this.viewDirectionVector, this.upVector);
        glMatrix.vec3.rotateY(rotateAxis, rotateAxis, [0.0, 1.0, 0.0], this.delta * Math.PI / 180.0);
        glMatrix.vec3.scale(rotateAxis, rotateAxis, this.delta)
        glMatrix.vec3.sub(this.viewDirectionVector, this.viewDirectionVector, rotateAxis);
        
        this.updateCameraMatrix();
    }
    updateCameraMatrix() {
        let deltaMove = glMatrix.vec3.create();
        glMatrix.vec3.add(deltaMove, this.positionVector, this.viewDirectionVector);
        glMatrix.mat4.lookAt(this.cameraMatrix, this.positionVector, deltaMove, this.upVector);
    }
}
//creating the camera Object

let camera = new Camera();

//The user controls 
document.addEventListener("keydown", ProcessKeyPressedEvent, false);

function ProcessKeyPressedEvent(e) {
    //Processing the Camera Movement

    if (e.code === "KeyW") {
        console.log("---Forward");
        camera.moveForward();
    }
    if (e.code === "KeyS") {
        console.log("---Backward");
        camera.moveBackward();
    }
    if (e.code === "KeyA") {
        console.log("---StrafeLeft");
        camera.strafeLeft();
    }
    if (e.code === "KeyD") {
        console.log("---StrafeRight");
        camera.strafeRight();
    }
    if (e.code === "KeyI") {
        console.log("---MoveUp");
        camera.moveUp();
    }
    if (e.code === "KeyK") {
        console.log("---MoveDown");
        camera.moveDown();
    }
    if (e.code === "KeyJ") {
        console.log("---PanLeft");
        camera.panLeft();
    }
    if (e.code === "KeyL") {
        console.log("---PanRight");
        camera.panRight();
    }

    console.log(e);
}

function initWebGL() {
    const canvas = document.getElementById('draw_surface');
    var gl = canvas.getContext('webgl2');
    const handleToHTMLImage = document.getElementById('crateImg');
    const handleToHTMLImage2 = document.getElementById('crateImg2');
    gl.clearColor(1.0, 1.0, 1.0, 0.9);
    gl.enable(gl.DEPTH_TEST);
    console.log(ModelAttributeArray);
    //console.log(ModelAttributeArray.length)

    const vertexSource = fetch('vertex.glsl')
		.then(function (response){
			console.log('response object is returning vertex source');
			return response.text();
		});

	const fragSource = fetch('frag.glsl')
		.then(function (response) {
			console.log('response object is returning frag source');
			return response.text();
        });

	const shaderSource = {"vsrc": {}, "fsrc": {}};
	Promise.all([vertexSource, fragSource])
		.then(function (sourcesText) {
			console.log('====Resolved Promise.all====');
			shaderSource["vsrc"] = sourcesText[0];
            shaderSource["fsrc"] = sourcesText[1];
        })
        .then(function () {
            gpuProgram = makeShaders(shaderSource, gl);
            console.log("===Entering BufferLoop===")
			for(let i = 0; i < ModelAttributeArray.length; i++)
            {
                // create buffers for this mesh (vertex buffer, normal buffer, texture buffer and indcies buffer
                
                bufferCreator(gl, gpuProgram, handleToHTMLImage, ModelAttributeArray[i])
            }

        })
        .then(function () {
            console.log("===Entering DrawLoop===");
            console.log(ModelAttributeArray);
			drawloop();
		});

		function drawloop() {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            for(let i = 0; i < ModelAttributeArray.length; i++)
            {
                drawModel(gl, gpuProgram, ModelAttributeArray[i]);
                requestAnimationFrame(drawloop);
            }
			
		}

}

function makeShaders(shaderSource, gl){
    //creating shader programs
    let shaderProgram = gl.createProgram();
    //console.log(ModelAttributeArray[0]);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, shaderSource['vsrc']);
    gl.compileShader(vertShader);
    let success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertShader));
    }
    gl.shaderSource(fragShader, shaderSource['fsrc']);
    gl.compileShader(fragShader);
    let success2 = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if (!success2) {
        console.log(gl.getShaderInfoLog(fragShader));
    }
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(shaderProgram);
        throw 'Could not compile WebGL program \n\n' + info;
    }
    //created shader programs

    return shaderProgram;
}


function bufferCreator(gl, shaderProgram, imgName, res) {
    let object = {};
   
    //create buffer objects (vertex buffer, color buffer objects, and index buffer object)
    res.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, res.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res.vertices), gl.STATIC_DRAW);


    res.coord = gl.getAttribLocation(shaderProgram, "vertPosition");
    gl.vertexAttribPointer(res.coord,
        //index in shader program or use the value returned from getAttriblocation
        3,
        //number of elements for this attribute
        gl.FLOAT,
        //type of value, i.e.float
        gl.FALSE,
        //is the data normalized
        0,
        // stried to next vertex position vertex element (we have two attributes for each vertex)ww
        0 // offset in the buffer array.

    );

    gl.enableVertexAttribArray(res.coord);


    //create normal buffer
    res.normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, res.normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res.normals), gl.STATIC_DRAW);

    res.coordNormal = gl.getAttribLocation(shaderProgram, "vertNormal");
    gl.vertexAttribPointer(res.coordNormal, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(res.coordNormal);


    //create new textCoor
	res.texCoorBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, res.texCoorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res.textureCoords), gl.STATIC_DRAW);

	res.texPositionAttribLocation = gl.getAttribLocation(shaderProgram, 'vTextCoord')
	gl.vertexAttribPointer(res.texPositionAttribLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(res.texPositionAttribLocation);


    //create index buffer
    res.index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, res.index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(res.indexs), gl.STATIC_DRAW);


    //create texture buffer
    res.texImgBufferObject = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, res.texImgBufferObject);
	/*
	https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
	gl.texImage2D(target,level,internalformat, width, height, border, format, type, HTMLImageElement source)
	*/
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgName.width, imgName.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgName);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //s-axis
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //t axis
    //set filtering nodes: how to calculate pixel value when pixel does not flal on texel coord
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // unbind texture
	gl.bindTexture(gl.TEXTURE_2D, null);

}

var counter = 0;
function drawModel(gl, gpu, res) {
    counter = counter + 0.25;

    gl.useProgram(gpu);

/*****************Cube!! Shape Start******************/
/****************************************************/
    gl.bindBuffer(gl.ARRAY_BUFFER, res.vertex_buffer);
    gl.vertexAttribPointer(res.coord, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(res.coord);
    

    //binding texture coord position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, res.texCoorBufferObject);
    gl.vertexAttribPointer(res.texPositionAttribLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(res.texPositionAttribLocation);

    //texture image buffer, TEXTURE0 is default
    gl.activeTexture(gl.TEXTURE0);

    let texLocation = gl.getUniformLocation(gpu, 'textureImg');
    //binding the texture buffer
    gl.bindTexture(gl.TEXTURE_2D, res.texImgBufferObject);
    //to which texture unit
    gl.uniform1i(texLocation, 0); // bind the current texture buffer to texture unit 0 (default)

    //setup normal attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, res.normal_buffer);
    gl.vertexAttribPointer(res.coordNormal, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(res.coordNormal);

    //set Ambient Light
    let uAmbientColorLocation = gl.getUniformLocation(gpu, 'uAmbientLightColor');
    gl.uniform3fv(uAmbientColorLocation, [0.2, 0.2, 0.2]);

    //set Diffuse Light Color
    let uDiffuseColorLocation = gl.getUniformLocation(gpu, 'uDiffuseLightColor');
    gl.uniform3fv(uDiffuseColorLocation, [1.0, 1.0, 1.0]);

    //set diffuse light color
    let uDiffuseDirectionLocation = gl.getUniformLocation(gpu, 'uDiffuseLightDirection');
    gl.uniform3fv(uDiffuseDirectionLocation, [-1.0, -1.0, 1.0]);

    //uniform color
    let ucolorLocation = gl.getUniformLocation(gpu, 'uColor');
    gl.uniform3fv(ucolorLocation, [1.0, 0.0, 0.0]);
    
    //projection matrix
    let projMatrix = glMatrix.mat4.create();
    let projMatrixLocation = gl.getUniformLocation(gpu, 'projMatrix');

    glMatrix.mat4.perspective(projMatrix, Math.PI / 180 * 60, 800 / 600, 0.1, 100.0);
    gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);

    //model Matrix
    let modelMatrix = glMatrix.mat4.create();
    let modelMatrixLocation = gl.getUniformLocation(gpu, 'modelToWorldMatrix');

    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0]);
    glMatrix.mat4.rotate(modelMatrix, modelMatrix, counter / 20, [0.0, 1.0, 0.0]);
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.01, 0.01, 0.01]);

    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    //view matrix (camera)
    let viewMatrixLocation = gl.getUniformLocation(gpu, 'viewMatrix');
    gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix);

    //uniform
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, res.index_buffer);
    //console.log(res.index);
    gl.drawElements(gl.TRIANGLES, res.indexs.length, gl.UNSIGNED_SHORT, 0);
}



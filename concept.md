 It turns out that the equations to compute the coordinates of a projected points can actually somehow be expressed in the form of a 4x4 matrix. 

However, expressed in the form a matrix, you can reduce this series of operations to a single point-matrix multiplicationBeing able to represent this critical operation in such a compact and easy to use form is the main advantage of this approach

It turns out, that the perspective projection process, and its associated equations, can be expressed in the form of a 4x4 matrix indeed

This is what we call the perspective projection matrix. Multiplying any point whose coordinates are expressed with respect to the camera coordinate system (see below), by this perspective projection matrix, will give you the position (or coordinates) of that point onto the canvas.


what is projection:
>  the projection process can be seen as if the point we want to project was moved down along a line connecting the point or the vertex itself to the eye. We can stop moving the point along that line when it lies on the plane of the canvas. Obviously we don't "slide" the point along this line explicitly, but this how the projection process can be interpreted.


# Matrix:
Two matrices M1 and M2 can only be multiplied if the number of columns in M1 is equal to the number of rows in M2
A 4x2 and 2x3 matrices can be multiplied and will give a 4x3 matrix
[M×P]∗[P×N]=[M×N]

Matrix multiplication indeed is not commutative. M1*M2 doesn't give the same result than M2*M1

 For instance two matrices which sizes are m x p and p x n can be multiplied with each other. The resulting matrix combines the transformation of the two matrices used in the multiplication
## Matrix Multiplication
 Imagine you need to transform a point from A to B using matrix M1 and then transform B to C using matrix M2. Multiplying M1 by M2 gives a matrix M3 which directly transforms A to C. A matrix obtained by multiplying two matrices is not different from the other two



## coriutine
http://stackoverflow.com/questions/12932306/how-does-startcoroutine-yield-return-pattern-really-work-in-unity

### Unity is Single Threaded

Coroutines are not threads. Unity is single threaded. There is one main loop of Unity and all those functions that you write are being called by the same main thread in order. You can verify this by placing a while(true); in any of your functions or coroutines. It will freeze the whole thing, even the Unity editor. This is evidence that everything runs in one main thread. This link that Kay mentioned in his above comment is also a great resource.

 When Unity will resume your coroutine depends on what X was in your yield return X. For example, if you used yield return new WaitForSeconds(3);, it resumes after 3 seconds have passed. If you used yield return StartCoroutine(AnotherCoroutine()), it resumes after AnotherCoroutine() is completely done, which enables you to nest behaviors in time. If you just used a yield return null;, it resumes right at the next frame.

 Another good one:
 It couldn't be simpler:

Unity (and all game engines) are frame based.

The whole entire point, the whole raison d'etre of Unity, is that it is frame based. The engine does things "each frame" for you. (Animates, renders objects, does physics, and so on.)

You might ask .. "Oh, that's great. What if I want the engine to do something for me each frame? How do I tell the engine to do such-and-such in a frame?"

The answer is ...

That's exactly what a "coroutine" is for.

It's just that simple.

And consider this....

You know the "Update" function. Quite simply, anything you put in there is done every frame. It's literally exactly the same, no difference at all, from the coroutine-yield syntax.

void Update()
 {
 this happens every frame,
 you want Unity to do something of "yours" in each of the frame,
 put it in here
 }

...in a coroutine...
 while(true)
 {
 this happens every frame.
 you want Unity to do something of "yours" in each of the frame,
 put it in here
 yield return null;
 }
There is absolutely no difference.

Footnote: as everyone has pointed out, Unity simply has no threads. The "frames" in Unity or in any game engine have utterly no connection to threads in any way.

Coroutines/yield are simply how you access the frames in Unity. That's it. (And indeed, it's absolutely the same as the Update() function provided by Unity.) That's all there is to it, it's that simple.
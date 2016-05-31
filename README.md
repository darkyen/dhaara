# dhaara
Node.js style duplex stream over the top of socket.io!


# Installation
```bash
npm install --save darkyen/dhaara
```

#Usage

```javascript

// On server and client both!

const stream = new Dhaara({
  socket: socketInstanceFromSocketIO,
  name: 'yourAwesomeStreamName',
});

// at this point this is a duplex stream so 
// do whatever you want
```


# Example

To create a simple unix style echo with socket.io you can do

```
  io.on('connection, function(socket){
    const stream = new Dhaara({
      name: 'echo',
      socket,
    });
    
    stream.pipe(stream);
  });
```


Then connect to this on client and pipe a nice text file, this way

```
const socket = io.connect('/ppath/ttoo/sseervveer');
socket.on('connection', function(){
  const keyboardStream = new KeyboardStream();
  keyboardStream.pipe(new Dhaara({
    name: 'echo',
    socket
  });
});
```

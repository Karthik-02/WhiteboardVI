import { useState, useEffect } from "react";
import { fabric } from "fabric";
import axios from "axios";
import './App.css';

function White() {
  const [canvas, setCanvas] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [pencilSize, setPencilSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pages, setPages] = useState([]);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const newCanvas = new fabric.Canvas("canvas");
    newCanvas.setHeight(window.innerHeight);
    newCanvas.setWidth(window.innerWidth);
    newCanvas.isDrawingMode = true;
    newCanvas.freeDrawingBrush.width = pencilSize;
    newCanvas.freeDrawingBrush.color = selectedColor;
    setCanvas(newCanvas);
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.width = pencilSize;
      canvas.freeDrawingBrush.color = selectedColor;
    }
  }, [canvas, pencilSize, selectedColor]);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.width = eraserSize;
      canvas.freeDrawingBrush.color = "#ffffff"; // Set brush color to white for eraser
    }
  }, [canvas, eraserSize]);

  useEffect(() => {
    if (canvas && pages.length > 0) {
      canvas.clear();
      canvas.add(pages[currentPage - 1]);
    }
  }, [canvas, pages, currentPage]);

  useEffect(() => {
    if (canvas) {
      // Create initial page
      const page = new fabric.Image(canvas?.toDataURL(), {
        selectable: false,
      });
      setPages([page]);
      setPageCount(1);
      setCurrentPage(1);
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      // Save the changes to the current page before switching
      saveCurrentPage();
    }
  }, [currentPage]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleAddPage = () => {
    const newPage = new fabric.Image(canvas?.toDataURL(), {
      selectable: false,
    });
    setPages([...pages, newPage]);
    setPageCount(pageCount + 1);
    setCurrentPage(pageCount + 1);
  };

  const handleDeletePage = () => {
    if (pageCount > 1) {
      const updatedPages = [...pages];
      updatedPages.splice(currentPage - 1, 1);
      setPages(updatedPages);
      setPageCount(pageCount - 1);
      setCurrentPage(Math.min(currentPage, pageCount - 1));
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      // Save the changes to the current page before switching
      saveCurrentPage();
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      // Save the changes to the current page before switching
      saveCurrentPage();
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSavePage = () => {
    if (canvas) {
      saveCurrentPage();
    }
  };

  const saveCurrentPage = () => {
    const currentPageIndex = currentPage - 1;
    const currentCanvasDataUrl = canvas.toDataURL();

    fabric.Image.fromURL(currentCanvasDataUrl, (img) => {
      const updatedPages = [...pages];
      updatedPages[currentPageIndex] = img;
      setPages(updatedPages);
    });
  };

  const saveToServer = async () => {
    try {
      const response = await axios.post("/api/save-canvas", {
        pages: pages.map((page) => page.toDataURL()),
      });
      console.log(response.data); // Handle the response from the server
    } catch (error) {
      console.error("Error saving canvas:", error);
    }
  };

  const loadFromServer = async () => {
    try {
      const response = await axios.get("/api/load-canvas");
      const { pages } = response.data;
      const fabricPages = [];

      for (const pageData of pages) {
        const img = await loadImage(pageData);
        const fabricImg = new fabric.Image(img, {
          selectable: false,
        });
        fabricPages.push(fabricImg);
      }

      setPages(fabricPages);
      setPageCount(fabricPages.length);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading canvas:", error);
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleToolClick = () => {
    setShowTools(!showTools);
  };

  const handleToolSelection = (tool) => {
    switch (tool) {
      case "Pan":
        if (canvas) {
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = "move";
        }
        break;
      case "Pencil":
        if (canvas) {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = pencilSize;
          canvas.freeDrawingBrush.color = selectedColor;
          canvas.selection = false;
          canvas.defaultCursor = "default";
        }
        break;
      
      case "Highlighter":
        if (canvas) {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = pencilSize;
          canvas.freeDrawingBrush.color = "#FFFF00"; // Yellow color for highlighter
          canvas.selection = false;
          canvas.defaultCursor = "default";
        }
        break;
      case "Circle":
        if (canvas) {
          const circle = new fabric.Circle({
            radius: 50,
            fill: selectedColor,
            left: 100,
            top: 100,
          });
          canvas.add(circle);
        }
        break;
      case "Square":
        if (canvas) {
          const square = new fabric.Rect({
            width: 100,
            height: 100,
            fill: selectedColor,
            left: 100,
            top: 100,
          });
          canvas.add(square);
        }
        break;
      case "Rectangle":
        if (canvas) {
          const rectangle = new fabric.Rect({
            width: 150,
            height: 100,
            fill: selectedColor,
            left: 100,
            top: 100,
          });
          canvas.add(rectangle);
        }
        break;
      case "Triangle":
        if (canvas) {
          const triangle = new fabric.Triangle({
            width: 100,
            height: 100,
            fill: selectedColor,
            left: 100,
            top: 100,
          });
          canvas.add(triangle);
        }
        break;
      
      case "Line":
        if (canvas) {
          const line = new fabric.Line([50, 50, 200, 200], {
            stroke: selectedColor,
            strokeWidth: 2,
          });
          canvas.add(line);
        }
        break;
      case "Curve":
        if (canvas) {
          const curve = new fabric.Path("M 100 200 Q 100 100 200 100", {
            stroke: selectedColor,
            fill: "transparent",
          });
          canvas.add(curve);
        }
        break;
      case "Oval":
        if (canvas) {
          const oval = new fabric.Ellipse({
            rx: 80,
            ry: 50,
            fill: selectedColor,
            left: 100,
            top: 100,
          });
          canvas.add(oval);
        }
        break;
        
     
      
      default:
        break;
    }
  
    setShowTools(false); // Hide the tools dropdown after selection
  };
  
  

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center",marginTop:50}}>
        <div>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: selectedColor,
              marginRight: "10px",
              marginLeft: "50px",
            }}
            onClick={handleToolClick}
          >
             <img
        style={{ height: 20 }}
        src="https://www.hsenidmobile.com/wp-content/uploads/2015/09/tools-icon-white-300x300.png"
        alt="Tool"
      />
          </button>
          {showTools && ( // Display the tools dropdown only when showTools is true
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                left: "70px",
                top: "70px",
                zIndex: 999,
              }}
            >
              {/* Tool buttons  all the tools are listed below */}
              
              <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Pencil")}>
           <img
        style={{ height: 20 }}
        src="https://www.freeiconspng.com/uploads/description-white-pencil-16.png"
        alt="Pencil"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Pan")}> <img
        style={{ height: 20 }}
        src="https://pic.onlinewebfonts.com/svg/img_440159.png"
        alt="Pan"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Highlighter")}><img
        style={{ height: 20 }}
        src="https://game-icons.net/icons/ffffff/transparent/1x1/delapouite/highlighter.png"
        alt="Highlight"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Circle")}><img
        style={{ height: 20 }}
        src="https://clipartcraft.com/images/circle-transparent-icon-3.png"
        alt="Circle"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Square")}><img
        style={{ height: 20 }}
        src="https://pngimg.com/uploads/square/square_PNG29.png"
        alt="Sq"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Rectangle")}><img
        style={{ height: 20 }}
        src="https://cdn-icons-png.flaticon.com/512/33/33848.png"
        alt="Rect"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Triangle")}><img
        style={{ height: 20 }}
        src="https://th.bing.com/th/id/R.89ccedc4bcbb6199a80362bc0395bd05?rik=m35aJI481wtISg&riu=http%3a%2f%2fpluspng.com%2fimg-png%2ftriangle-png-big-image-png-2236.png&ehk=DyjsHVKmqE44BYN8fcPOSyag1E7xqcOQ4QDP3hDuvo4%3d&risl=&pid=ImgRaw&r=0"
        alt="tri"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Oval")}><img
        style={{ height: 10 }}
        src="https://cdn.onlinewebfonts.com/svg/img_448739.png"
        alt="Ov"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Line")}><img
        style={{ height: 20 }}
        src="https://clipground.com/images/white-thick-line-clipart.png"
        alt="line"
      /></button>
        <button  style={{width: "35px",height: "35px",borderRadius: "50%",backgroundColor: selectedColor,marginRight: "10px",marginLeft: "50px",}}
        onClick={() => handleToolSelection("Curve")}><img
        style={{ height: 20 }}
        src="https://th.bing.com/th/id/OIP.Df-2_KQmXII5WlAQ4uJt1QHaHG?pid=ImgDet&rs=1"
        alt="line"
      /></button>
            </div>
          )}

          <input
            style={{ marginLeft: "30px" }}
            type="range"
            min="1"
            max="10"
            value={pencilSize}
            onChange={(e) => setPencilSize(Number(e.target.value))}
          />

          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

          {["#333333", "#1f9652", "#f2c94d", "#317eee", "#eb5757"].map(
            (color) => (
              <button
                key={color}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  marginRight: "10px",
                  border: selectedColor === color ? "3px solid #000" : "none",
                }}
                onClick={() => handleColorChange(color)}
              >
                {selectedColor === color && (
                  <img
                    style={{ height: "20px" }}
                    src="https://th.bing.com/th/id/R.071eb10e44fa89c7e13c389f27346a72?rik=%2bf2dhQxiHmQyoQ&riu=http%3a%2f%2fwww.clker.com%2fcliparts%2fx%2fn%2f7%2fm%2fp%2fg%2fcheck-mark-in-white-hi.png&ehk=6WPax6dqWQjs4ZJLqZymZNiQu5TZnlJO7jqRA3O4aDo%3d&risl=&pid=ImgRaw&r=0"
                    alt="Tick mark"
                  />
                )}
              </button>
            )
          )}
        </div>
        <div>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "200px",
            }}
            onClick={() => {
              setPencilSize(pencilSize);
              setEraserSize(eraserSize);
            }}
          >
            <img
              style={{ height: 20 }}
              src="https://th.bing.com/th/id/R.1f5b562b1b03e938c635b0640353e529?rik=wGMr8GR7BbUk5A&riu=http%3a%2f%2fcdn.onlinewebfonts.com%2fsvg%2fimg_521072.png&ehk=Olfb6wzrjCK4utELrcswXOtZJnAGGdWprnt1J3X7QbU%3d&risl=&pid=ImgRaw&r=0"
              alt="Eraser"
            />
          </button>
          <input
            type="range"
            min="10"
            max="50"
            value={eraserSize}
            onChange={(e) => setEraserSize(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </div>

        <div>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={handlePreviousPage}
          >
            &lt;
          </button>
          &nbsp;&nbsp;&nbsp;
          <span>{`${currentPage}/${pageCount}`}</span>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={handleNextPage}
          >
            &gt;
          </button>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={handleAddPage}
          >
            <img
              style={{ height: 20 }}
              src="https://th.bing.com/th/id/R.78fc384e8e4bde3360e0234566bd5b1c?rik=YhuZtOkRYupJwg&riu=http%3a%2f%2fcdn.onlinewebfonts.com%2fsvg%2fimg_138535.png&ehk=fdMTUunc2CtwbdnCfI%2faem9sBD2bEgpdAZ2a3S7ZW%2b4%3d&risl=&pid=ImgRaw&r=0"
              alt="Add Page"
            />
          </button>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={handleDeletePage}
          >
              <img
              style={{ height: 20 }}
              src="https://cdn.onlinewebfonts.com/svg/img_47726.png"
              alt="Remove Page"
             />
            
          </button>
        </div>
        <div>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={handleSavePage}
          >
               <img
              style={{ height: 15 }}
              src="https://cdn.onlinewebfonts.com/svg/img_393894.png"
              alt="Remove Page"
             />
          </button>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={saveToServer}
          >
           <img
              style={{ height: 20 }}
              src="https://cdn2.iconfinder.com/data/icons/line-design-database-set-4/21/server-database-save-512.png"
              alt="Remove Page"
             /> 
          </button>
          <button
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "white",
              marginLeft: "20px",
            }}
            onClick={loadFromServer}
          >
            <img
              style={{ height: 20 }}
              src="https://cdn.icon-icons.com/icons2/390/PNG/512/load_39552.png"
              alt="Remove Page"
             /> 
          </button>
        </div>
      </div>
      <canvas id="canvas" />
    </div>
  );
}

export default White;
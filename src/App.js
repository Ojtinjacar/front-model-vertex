import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react"
import axios from "axios";
function App() {

  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()
  const [flag, setFlag] = useState(false)
  const [result, setResult] = useState(false)
  const [imageBase64, setImageBase64] = useState("")
  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const onSelectFile = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0])
    let file = e.target.files[0];
    getBase64(file)
      .then(result => {
        file["base64"] = result;
      })
      .catch(err => {
        console.log(err);
      });
  }

  const getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        baseURL = reader.result;
        setImageBase64(baseURL.split("base64,")[1])
        resolve(baseURL);
      };
    });
  };


  const testImage = async () => {
    await axios
      .post(
        `https://us-central1-ai-brain-tumor-recognition.cloudfunctions.net/image_prediction`,
        {
          base64: imageBase64
        },
      )
      .then((response) => {
        setFlag(true)
        if (response.data === "healthy") {
          setResult(true)
        }
        else {
          setResult(false)
        }
      })
      .catch((error) => {
      });
  }
  return (
    <div className="App">
      <div className="container">
        <div class="row">
          <div className="card text-center" style={{ "width": "18rem;" }}>
            <div class="card-body">
              <h5 class="card-title">Testing a model made in Vertex AI</h5>
              <p class="card-text">This website will allow you to submit a brain MRI image and show whether the brain is healthy or not.</p>
              <p class="card-text">Steps:</p>
              <p class="card-text">1. Choose an image related to brain MRI.</p>
              <p class="card-text">2. Click on "¡Test Me!".</p>
              {flag ? result ? <>
              <div class="alert alert-success" role="alert">
                According to the model this MRI corresponds to an brain healthy.
              </div></> : <>
              <div class="alert alert-danger" role="alert">
                According to the model this image corresponds to brain MRI with a tumor.
              </div></> : ""}
              <div>
                <input type='file' onChange={onSelectFile} />
                {selectedFile && <img src={preview} />}
              </div>
            </div>
            <button type="button" class="btn btn-warning" onClick={testImage}>¡Test Me!</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"
import Swal from "sweetalert2"
import HtmlCodeContainer from "./HtmlCodeContainer"
import CssCodeContainer from "./CssCodeContainer"
import JsCodeContainer from "./JsCodeContainer"
import { fileToGenerativePart, geminiAIModels, getUserPrompt, isStorageExist } from "../../../../utils/data"
import DownloadFileModal from "../pop_up/DownloadFileModal"
import JSZip from "jszip"
import { createIframeWorker } from "../../../../utils/worker"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      GEMINI_AI_TEMPERATURE_STORAGE_KEY: 'GEMINI_AI_TEMPERATURE_STORAGE_KEY',
      GEMINI_AI_MODEL_STORAGE_KEY: 'GEMINI_AI_MODEL_STORAGE_KEY',
      CHUNKED_PROMPTS_STORAGE_KEY: 'CHUNKED_PROMPTS_STORAGE_KEY',
      USER_PROMPTS_STORAGE_KEY: 'USER_PROMPTS_STORAGE_KEY',
      USER_RESULTS_STORAGE_KEY: 'USER_RESULTS_STORAGE_KEY',
      TEMP_WEB_PREVIEW_STORAGE_KEY: 'TEMP_WEB_PREVIEW_STORAGE_KEY',
      savedApiKey: localStorage.getItem('USER_API_STORAGE_KEY'),
      temperature: 10,
      geminiAIModels: geminiAIModels,
      selectedModel: geminiAIModels[1],
      isLoading: false,
      isEditing: false,
      isGenerating: false,
      isSidebarOpened: false,
      currentPrompt: `Token Name: Your token name
Token Paragraph:
Paragraph 1: A brief paragraph explaining the purpose of the AI website generator
Contract Address: 0x1234567890abcdef1234567890abcdef12345678

"`,
      lastPrompt: '',
      promptId: 0,
      chunkedPromptsData: [],
      getSortedChunkedPrompts: [],
      sortBy: this.props.t('sort_chunked_prompts.0'),
      currentImgFiles: [],
      currentImgURLs: [],
      lastImgFiles: [],
      abortController: null,
      responseResult: '',
      areCodesCopied: false,
      areTextsWrapped: false,
      isHTMLCodeCopied: false,
      isCSSCodeCopied: false,
      isJSCodeCopied: false,
      isDialogOpened: false,
      userChatData: null
    }
    this.inputRef = React.createRef()
    this.fileInputRef = React.createRef()
    this.tempSettingInfoRef = React.createRef()
    this.tempSettingContentInfoRef = React.createRef()
    this.iframeRef = React.createRef()
  }

  componentDidMount() {
    this.setState({ responseResult: `<html lang="en">
<head>
  <title>SWAG Token AI Website Builder - Create A Website In Minutes</title>
  <style>
    body {
      background-color: #fff8db;
      font-family: 'Comic Sans MS', cursive, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      color: #333;
    }

    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      text-align: center;
      width: 90%;
      animation: fadeIn 1s ease-in-out;
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    img {
      max-width: 80%;
      height: auto;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 2.8rem;
      margin-bottom: 5px;
      color: #ff6347;
      text-shadow: 2px 2px #fdd835;
    }

    h2 {
      font-size: 1.8rem;
      color: #333;
      margin-bottom: 15px;
    }

    p {
      line-height: 1.6;
      margin-bottom: 15px;
      color: #555;
    }

.button-container {
  display: flex;
  gap: 10px;
  justify-content: center;  /* Center horizontally */
  align-items: center;      /* Center vertically */
}

    button {
      background-color: #ff6347;
      color: #fff;
      padding: 12px 25px;
      border: none;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, background-color 0.3s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    button:hover {
      background-color: #e5533b;
      transform: scale(1.05);
    }

    /* Add a hover effect for each button */
    .button-container button:nth-child(1):hover {
      background-color: #007bff;
    }

    .button-container button:nth-child(2):hover {
      background-color: #28a745;
    }

    .button-container button:nth-child(3):hover {
      background-color: #1da1f2;
    }

    .button-container button:nth-child(4):hover {
      background-color: #ffa500;
    }

    .button-container button:nth-child(5):hover {
      background-color: #0088cc;
    }
  </style>
</head>
<body>
  <div class="container">

  <div>
<h1>BUBBLEAI - The First AI Website Generator on Solana</h1>
<h2>Created by Richie.eth</h2>
<p>BUBBLE aims to empower developers on Pump.Fun with a tool to easily create high-quality websites for their tokens.</p>
<p>Simply enter a description of what your token is about, and BUBBLE will handle the rest, generating a professional website with zero coding required!</p>
    <div class="button-container">
      <button>Twitter</button>
      <button>Buy BUBBLE</button>
    </div>
  </div>
</body>
</html>
` })
    this.loadSavedGeminiTemp()
    this.loadSavedGeminiModel()
    this.loadChunkedPrompts().then(() => {
      if (location.toString().includes('/prompt') && location.toString().includes('?id=')) this.loadPromptAndResult()
      setTimeout(() => {
        this.setState({
          sortBy: this.props.t('sort_chunked_prompts.0'),
          getSortedChunkedPrompts: this.state.chunkedPromptsData
        })
      }, 10)
    })
    if (this.state.currentPrompt.length > 0 || this.state.currentImgFiles.length > 0 || this.state.isEditing) {
      addEventListener('beforeunload', () => {
        this.onUnloadPage.bind(this)
        localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.responseResult !== this.state.responseResult) this.showHTMLIframe()
    if (prevState.currentImgFiles.length !== this.state.currentImgFiles.length && this.state.currentImgFiles.length > 0) {
      this.setState(({ currentImgURLs: [...this.state.currentImgFiles.map(file => URL.createObjectURL(file))]
      }))
    }
    if (prevProps.t('sort_chunked_prompts.0') !== this.props.t('sort_chunked_prompts.0')) {
      this.setState({ sortBy: this.props.t('sort_chunked_prompts.0') })
    }
    if (!this.state.isLoading || !this.state.isGenerating) removeEventListener('beforeunload', this.onUnloadPage)
    if (this.state.isLoading || this.state.isGenerating || this.state.currentPrompt.length > 0 || this.state.currentImgFiles.length > 0 || this.state.isEditing) {
      addEventListener('beforeunload', this.onUnloadPage)
    }
  }

  componentWillUnmount() {
    removeEventListener('beforeunload', () => {
      this.onUnloadPage.bind(this)
      if (this.state.isLoading || this.state.isGenerating) {
        if (this.state.responseResult !== '') this.saveUserResultData()
        this.stopPrompt()
      }
      localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
    })
  }

  onUnloadPage (event) {
    event.preventDefault()
    event.returnValue = this.props.t('unsaved_warning')
  }

  loadSavedGeminiTemp() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const geminiAITemperature = localStorage.getItem(this.state.GEMINI_AI_TEMPERATURE_STORAGE_KEY) || this.state.temperature
      this.setState({ temperature: geminiAITemperature })
    }
  }

  loadSavedGeminiModel() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const geminiAIModel = localStorage.getItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY) || this.state.selectedModel.variant
      this.setState({ selectedModel: geminiAIModels.find(model => model.variant === geminiAIModel) })
    }
  }

  searchHandler(event) {
    const searchQuery = event.target.value.toLowerCase()
    const { sortBy } = this.state
    const chunkedPromptList = this.state.chunkedPromptsData
    if (searchQuery.length === 0) this.sortHandler(sortBy)
    else {
      let searchData = chunkedPromptList
      if (sortBy !== this.props.t('sort_chunked_prompts.0')) {
        searchData = chunkedPromptList.filter(chunkedPrompt => chunkedPrompt.promptChunk === sortBy)
      }
      searchData = searchData.filter(chunkedPrompt => chunkedPrompt.promptChunk.toLowerCase().includes(searchQuery))
      this.setState({ getSortedChunkedPrompts: searchData })
    }
    scrollTo(0, 0)
  }

  sortHandler(sortBy) {
    const chunkedPromptList = this.state.chunkedPromptsData.map(chunkedPrompt => ({ ...chunkedPrompt }))
    if (sortBy === this.props.t('sort_chunked_prompts.0')) {
      this.setState({ getSortedChunkedPrompts: chunkedPromptList })
    } else {
      const sortedChunkedPrompts = chunkedPromptList.sort((a, b) => b.id - a.id)
      this.setState({ getSortedChunkedPrompts: sortedChunkedPrompts })
    }
    this.setState({ sortBy: sortBy })
  }

  async loadChunkedPrompts() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const chunkedPrompts = localStorage.getItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
      try {
        const parsedChunkedPrompts = await JSON.parse(chunkedPrompts)
        if (parsedChunkedPrompts !== null) {
          this.setState({
            chunkedPromptsData: parsedChunkedPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
            getSortedChunkedPrompts: parsedChunkedPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          })
        }
      } catch (error) {
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
      }
    }
  }

  loadPromptAndResult() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved) && location.toString().includes('?id=')) {
      let userPrompts = localStorage.getItem(this.state.USER_PROMPTS_STORAGE_KEY)
      let userResults = localStorage.getItem(this.state.USER_RESULTS_STORAGE_KEY)
      try {
        let parsedUserPrompts = JSON.parse(userPrompts)
        let parsedUserResults = JSON.parse(userResults)
        if (parsedUserPrompts !== null && parsedUserPrompts[0].id !== undefined) {
          const foundPrompt = parsedUserPrompts.find(prompt => prompt.id === getUserPrompt())
          if (foundPrompt) {
            this.setState({ promptId: foundPrompt?.id, lastPrompt: foundPrompt?.prompt }, () => {
              userPrompts = null
              parsedUserPrompts = null
            })
          } else {
            userPrompts = null
            parsedUserPrompts = null
            Swal.fire({
              icon: 'error',
              title: this.props.t('prompt_not_found.0'),
              text: this.props.t('prompt_not_found.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            }).then(() => history.pushState('', '', location.origin))
          }
        }
        if (parsedUserResults !== null && parsedUserResults[0].id !== undefined) {
          const foundResult = parsedUserResults.find(result => result.id === getUserPrompt())
          if (foundResult) {
            this.setState({ responseResult: foundResult?.result }, () => {
              userResults = null
              parsedUserResults = null
            })
          } else {
            userResults = null
            parsedUserResults = null
            Swal.fire({
              icon: 'error',
              title: this.props.t('result_not_found.0'),
              text: this.props.t('result_not_found.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            }).then(() => this.setState({ responseResult: '' }))
          }
        }
      } catch (error) {
        userPrompts = null
        userResults = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        history.pushState('', '', location.origin)
      }
    }
  }

  loadAllPrompts() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      let userPrompts = localStorage.getItem(this.state.USER_PROMPTS_STORAGE_KEY)
      try {
        const parsedUserPrompts = JSON.parse(userPrompts)
        if (parsedUserPrompts !== null && parsedUserPrompts[0].id !== undefined) {
          return parsedUserPrompts
        } else {
          return []
        }
      } catch (error) {
        userPrompts = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        return null
      }
    }
  }

  loadAllResults() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      let userResults = localStorage.getItem(this.state.USER_RESULTS_STORAGE_KEY)
      try {
        const parsedUserResults = JSON.parse(userResults)
        if (parsedUserResults !== null && parsedUserResults[0].id !== undefined) {
          return parsedUserResults
        } else {
          return []
        }
      } catch (error) {
        userResults = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        return null
      }
    }
  }

  handleTempChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ temperature: event.target.value }, () => {
        if (isStorageExist(this.props.t('browser_warning'))) localStorage.setItem(this.state.GEMINI_AI_TEMPERATURE_STORAGE_KEY, event.target.value)
      })
    }
  }

  showTempSettingInfo (event, isHovered) {
    setTimeout(() => {
      const tempSettingInfo = this.tempSettingInfoRef.current.getBoundingClientRect()
      const tempSettingContentInfo = this.tempSettingContentInfoRef.current
      const tooltipWidth = tempSettingContentInfo?.offsetWidth
      const tooltipHeight = tempSettingContentInfo?.offsetHeight
      const leftPosition = event.clientX
      const containerHalfWidth = document.documentElement.clientWidth / 2
      if (tempSettingContentInfo) {
        if (isHovered) {
          tempSettingContentInfo.style.display = 'block'
          tempSettingContentInfo.style.right = 'auto'
          if (leftPosition < containerHalfWidth) {
            tempSettingContentInfo.style.left = `${tempSettingInfo.right + 4}px`
            tempSettingContentInfo.style.top = `${tempSettingInfo.top - tooltipHeight}px`
          } else {
            tempSettingContentInfo.style.left = `${tooltipWidth + 8}px`
            tempSettingContentInfo.style.top = `${tempSettingInfo.top - 16}px`
          }
        } else tempSettingContentInfo.style.display = 'none'
      }
    }, 1)
  }

  changeGeminiModel(selectedVariant) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ selectedModel: this.state.geminiAIModels.find(model => model.variant === selectedVariant) }, () => {
        if (isStorageExist(this.props.t('browser_warning'))) {
          localStorage.setItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY, this.state.selectedModel.variant)
        }
        if (this.state.selectedModel.variant !== 'multimodal') this.setState({ currentImgFiles: [], currentImgURLs: [], lastImgFiles: [] })
      })
    }
  }

  handleCurrentPromptChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ currentPrompt: event.target.value })
    }
  }

  handleLastPromptChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ lastPrompt: event.target.value })
    }
  }

  pickCurrentImages(imgFiles) {
    if (imgFiles.length === 0) return
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    const maxFileSize = 10 * 1024 * 1024
    const validFiles = Array.from(imgFiles).filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (file.size > maxFileSize) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('file_size_limit.0'),
          text: this.props.t('file_size_limit.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      if (!validImageExtensions.includes(fileExtension)) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('invalid_file.0'),
          text: this.props.t('invalid_file.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      return true
    })
    if (validFiles.length > 0) {
      this.setState(prevState => {
        const currentImgFiles = [...prevState.currentImgFiles, ...validFiles]
        if (currentImgFiles.length > 10) {
          Swal.fire({
            icon: 'info',
            title: this.props.t('max_files_exceeded.0'),
            text: this.props.t('max_files_exceeded.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
          return
        }
        else return ({ currentImgFiles: currentImgFiles })
      })
    }
  }

  async takeScreenshot() {
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      const videoElement = document.createElement('video')
      videoElement.srcObject = captureStream
      videoElement.autoplay = true
      await new Promise(resolve => {
        videoElement.onloadedmetadata = () => {
          videoElement.width = videoElement.videoWidth
          videoElement.height = videoElement.videoHeight
          resolve()
        }
      })
      const canvas = document.createElement('canvas')
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        if (blob) {
          let imageFile = new File([blob], `Screenshot-${+new Date()}.png`, { type: 'image/png' })
          this.setState(prevState => {
            const currentImgFiles = [...prevState.currentImgFiles, imageFile]
            if (currentImgFiles.length > 10) {
              Swal.fire({
                icon: 'error',
                title: this.props.t('max_files_exceeded.0'),
                text: this.props.t('max_files_exceeded.1'),
                confirmButtonColor: 'blue',
                confirmButtonText: this.props.t('ok')
              })
              return
            }
            else return ({ currentImgFiles: currentImgFiles })
          }, () => imageFile = null)
        }
      }, 'image/png')
      captureStream.getVideoTracks().forEach(track => track.stop())
    } catch (error) {
      Swal.fire({
        title: this.props.t('capture_error'),
        text: error.message,
        icon: 'error',
        confirmButtonColor: 'blue'
      })
    }
  }

  pickLastImages(imgFiles) {
    if (imgFiles.length === 0) return
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    const maxFileSize = 10 * 1024 * 1024
    const validFiles = Array.from(imgFiles).filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (file.size > maxFileSize) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('file_size_limit.0'),
          text: this.props.t('file_size_limit.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      if (!validImageExtensions.includes(fileExtension)) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('invalid_file.0'),
          text: this.props.t('invalid_file.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      return true
    })
    if (validFiles.length > 0) {
      this.setState(prevState => {
        const lastImgFiles = [...prevState.lastImgFiles, ...validFiles]
        if (lastImgFiles.length > 10) {
          Swal.fire({
            icon: 'info',
            title: this.props.t('max_files_exceeded.0'),
            text: this.props.t('max_files_exceeded.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
          return
        }
        else return ({ lastImgFiles: lastImgFiles })
      })
    }
  }

  removeCurrentImage(index) {
    this.setState(prevState => {
      const currentImgFiles = prevState.currentImgFiles.filter((_, i) => i !== index)
      const currentImgURLs = prevState.currentImgURLs.filter((_, i) => i !== index)
      return { currentImgFiles: currentImgFiles, currentImgURLs: currentImgURLs }
    })
  }
  
  removeLastImages() {
    this.setState({ lastImgFiles: [] }, () => {
      if (this.fileInputRef.current) this.fileInputRef.current.value = ''
    })
  }
  
  async postPrompt(model, userPrompt, inputImages) {
    const themes = [
      'Background color for the body: Light yellow (#fff8db). Theme color for buttons and accents: Coral (#ff6347). Darker shade for hover effects: (#e5533b). Light cyan accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light navy (#1e2a47). Theme color for buttons and accents: Deep sea green (#2f8b8b). Darker shade for hover effects: (#1a6e6e). Soft cyan accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft peach (#ffdfbb). Theme color for buttons and accents: Sunset orange (#ff7f50). Darker shade for hover effects: (#ff5f36). Light yellow accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light lavender (#e3d9f5). Theme color for buttons and accents: Royal purple (#6a0dad). Darker shade for hover effects: (#4b0082). Light pink accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft mint (#c8f7f1). Theme color for buttons and accents: Mint green (#98ff98). Darker shade for hover effects: (#66cc66). Pale turquoise accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pale peach (#ffdab9). Theme color for buttons and accents: Tangerine (#ff6600). Darker shade for hover effects: (#e65c00). Light coral accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light gray (#d3d3d3). Theme color for buttons and accents: Slate blue (#6a5acd). Darker shade for hover effects: (#4b3b6a). Light purple accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft blush (#f8d7d2). Theme color for buttons and accents: Rose red (#d50032). Darker shade for hover effects: (#9c0031). Light mauve accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light beige (#f5f5dc). Theme color for buttons and accents: Forest green (#228b22). Darker shade for hover effects: (#006400). Pale yellow accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light sky blue (#87cefa). Theme color for buttons and accents: Sea blue (#4682b4). Darker shade for hover effects: (#355e6f). Light green accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft sand (#f4e1d2). Theme color for buttons and accents: Warm brown (#a52a2a). Darker shade for hover effects: (#7f1f1f). Light gold accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pastel green (#b0e57c). Theme color for buttons and accents: Olive green (#808000). Darker shade for hover effects: (#556b2f). Soft pink accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light lilac (#e1bee7). Theme color for buttons and accents: Purple orchid (#da70d6). Darker shade for hover effects: (#9b30b6). Light yellow accent for the container and text when dark mode is toggled.',
      'Background color for the body: Creamy white (#fff5e1). Theme color for buttons and accents: Goldenrod (#daa520). Darker shade for hover effects: (#b8860b). Soft blue accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pale pink (#fad0c4). Theme color for buttons and accents: Fuchsia (#d5008f). Darker shade for hover effects: (#9b007f). Light turquoise accent for the container and text when dark mode is toggled.',
      'Background color for the body: Sky gray (#a9a9a9). Theme color for buttons and accents: Electric blue (#7df9ff). Darker shade for hover effects: (#64c7c1). Soft purple accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft turquoise (#afeeee). Theme color for buttons and accents: Teal (#008080). Darker shade for hover effects: (#004d4d). Light coral accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pale yellow (#fff9c4). Theme color for buttons and accents: Buttercup yellow (#fbc02d). Darker shade for hover effects: (#f57f17). Light green accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light silver (#c0c0c0). Theme color for buttons and accents: Charcoal gray (#36454f). Darker shade for hover effects: (#2a2a2a). Soft amber accent for the container and text when dark mode is toggled.',
      'Background color for the body: Mint cream (#f5fffa). Theme color for buttons and accents: Deep green (#006400). Darker shade for hover effects: (#004d00). Light yellow-green accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light peach (#ffe4b5). Theme color for buttons and accents: Salmon (#fa8072). Darker shade for hover effects: (#e06666). Soft olive accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft rose (#f8c0b7). Theme color for buttons and accents: Blush pink (#f8b0c0). Darker shade for hover effects: (#f08a8a). Light lilac accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light plum (#e1c6e1). Theme color for buttons and accents: Deep plum (#7d4174). Darker shade for hover effects: (#5a2c54). Light violet accent for the container and text when dark mode is toggled.',
      'Background color for the body: Lavender mist (#e7e6fa). Theme color for buttons and accents: Orchid purple (#da70d6). Darker shade for hover effects: (#b64c8a). Soft pastel blue accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pale lavender (#d9bbd9). Theme color for buttons and accents: Plum (#8e4585). Darker shade for hover effects: (#72304b). Soft pinkish peach accent for the container and text when dark mode is toggled.',
      'Background color for the body: Seafoam green (#9fe2bf). Theme color for buttons and accents: Aquamarine (#7fffd4). Darker shade for hover effects: (#4d8b72). Light peach accent for the container and text when dark mode is toggled.',
      'Background color for the body: Apricot (#fbce91). Theme color for buttons and accents: Tangerine (#ff6600). Darker shade for hover effects: (#e65c00). Soft salmon accent for the container and text when dark mode is toggled.',
      'Background color for the body: Snow white (#fffbf0). Theme color for buttons and accents: Crimson (#dc143c). Darker shade for hover effects: (#8b0000). Soft ruby accent for the container and text when dark mode is toggled.',
      'Background color for the body: Peach (#f7e7ce). Theme color for buttons and accents: Honeydew green (#f0fff0). Darker shade for hover effects: (#c1d3c1). Soft lavender accent for the container and text when dark mode is toggled.',
      'Background color for the body: Ivory (#fffff0). Theme color for buttons and accents: Chiffon yellow (#fffae1). Darker shade for hover effects: (#e4d09c). Soft marigold accent for the container and text when dark mode is toggled.',
      'Background color for the body: Misty rose (#ffe4e1). Theme color for buttons and accents: Strawberry red (#fc5c5c). Darker shade for hover effects: (#f44d4d). Soft rose accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light peach (#ffbfae). Theme color for buttons and accents: Peachy keen (#ff9966). Darker shade for hover effects: (#e67f45). Light amber accent for the container and text when dark mode is toggled.',
      'Background color for the body: Warm ivory (#fff4e6). Theme color for buttons and accents: Golden honey (#ffcc33). Darker shade for hover effects: (#e6b32c). Soft cream accent for the container and text when dark mode is toggled.',
      'Background color for the body: Summer yellow (#ffec99). Theme color for buttons and accents: Lemonade yellow (#f7e0a7). Darker shade for hover effects: (#e6c12f). Soft beige accent for the container and text when dark mode is toggled.',
      'Background color for the body: Pale peach (#fce3c3). Theme color for buttons and accents: Orange peel (#ff9e00). Darker shade for hover effects: (#e68a00). Soft apricot accent for the container and text when dark mode is toggled.',
      'Background color for the body: Lavender gray (#c8c7c7). Theme color for buttons and accents: Royal purple (#6a0dad). Darker shade for hover effects: (#5b0080). Soft lilac accent for the container and text when dark mode is toggled.',
      'Background color for the body: Powder blue (#b0e0e6). Theme color for buttons and accents: Teal (#008080). Darker shade for hover effects: (#006666). Soft seafoam accent for the container and text when dark mode is toggled.',
      'Background color for the body: Misty blue (#afb9c1). Theme color for buttons and accents: Aqua blue (#00ffff). Darker shade for hover effects: (#009999). Soft lilac accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light rose (#f7e3e5). Theme color for buttons and accents: Powder pink (#f0c3c1). Darker shade for hover effects: (#f7a7a5). Soft mint accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft taupe (#d8cfc4). Theme color for buttons and accents: Olive green (#808000). Darker shade for hover effects: (#556b2f). Soft ivory accent for the container and text when dark mode is toggled.',
      'Background color for the body: Dusty pink (#d8bfd8). Theme color for buttons and accents: Orchid purple (#da70d6). Darker shade for hover effects: (#9b30b6). Soft lavender accent for the container and text when dark mode is toggled.',
      'Background color for the body: Light mint (#bafbd7). Theme color for buttons and accents: Teal blue (#367588). Darker shade for hover effects: (#2d5d6b). Light peach accent for the container and text when dark mode is toggled.',
      'Background color for the body: Off-white (#f8f8f8). Theme color for buttons and accents: Slate gray (#708090). Darker shade for hover effects: (#2f4f4f). Light blue accent for the container and text when dark mode is toggled.',
      'Background color for the body: Soft blush (#f8c0b7). Theme color for buttons and accents: Coral (#ff7f50). Darker shade for hover effects: (#e65c00). Soft lemon yellow accent for the container and text when dark mode is toggled.',
      'Background color for the body: Powder pink (#f9e3f1). Theme color for buttons and accents: Peach pink (#ffb6b9). Darker shade for hover effects: (#ff99b3). Soft orange accent for the container and text when dark mode is toggled.',
    ];
    
    

    const randomIndex = Math.floor(Math.random() * themes.length);

    let inputPrompt = ''
    if (this.state.selectedModel.isSupportSystemInstructions) inputPrompt = userPrompt
    else inputPrompt = `${this.props.t('system_instructions')} ${userPrompt}`
    inputPrompt = themes[randomIndex] + `Generate a detailed HTML page using Tailwind CSS with the following specifications:

Head:
Set the <title> of the webpage to "Token AI Website Builder - Create A Website In Minutes."
Add a <style> tag to customize the background gradient and typography. The gradient should be from purple to blue (#6b46c1 to #4299e1). The body text should be in white with a clean, sans-serif font such as Poppins.
Body:
Top Menu (Navigation Bar):
Create a navigation bar that:
Is fixed at the top of the page.
Has a semi-transparent purple background (#9b4d96 with 80% opacity).
Contains a logo on the left (styled with a font size of 1.25rem and bold text).
Contains four menu links: "Home," "Features," "How to Buy," and "Contact."
Each menu link should have a hover effect that changes the text color to yellow (#f6e05e).
Container:
Add a container that will hold the main content of the page:
The container should have a white background with 10% opacity (bg-white/10), a subtle box shadow, and rounded corners (rounded-xl).
It should be centered using Tailwind’s flexbox utilities (flex flex-col justify-center items-center).
Add padding (py-12 px-8) and apply a backdrop blur effect (backdrop-blur-lg).
Token Name:
Inside the container, add an <h1> header element with placeholder text "Your Token Name."
Style it with the theme’s main color (for example, text-yellow-300).
Apply a subtle text shadow with a lighter version of the background color (e.g., text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5)).
Token Description:
Add a <h2> subtitle element for the token description.
Style it with a white text color .
Place it directly under the token name.

Buttons:
Create four buttons, each linking to external pages. Each button should be styled as follows:

Button 1: Link format https://pump.fun/coin/CONTRACT_ADDRESS with the main background color (bg-yellow-500), white text, and a smooth hover effect that darkens the background color (hover:bg-yellow-400).
Button 2: Link format https://raydium.io/swap/?inputMint=sol&outputMint=CONTRACT_ADDRESS with a slightly darker yellow background (bg-yellow-400), white text, and hover effect.
Button 3: Link format https://jup.ag/swap/SOL-CONTRACT_ADDRESS with the main yellow background (bg-yellow-500) and white text.
Button 4: Link format https://dexscreener.com/solana/CONTRACT_ADDRESS with a darker yellow background (bg-yellow-400), white text.
The buttons should be displayed in a flex row with 5px gap between them (gap-4).

Contract Address Input Box:
Create an input box displaying the contract address (CONTRACT_ADDRESS).
Make the input box full width
the text color inside the input is black
Make it readonly and use a background that’s slightly transparent (bg-white/20).
Add a "Copy" button next to the input box that:
Copies the contract address to the clipboard using JavaScript.
The button should match the theme’s background color (bg-yellow-500), with white text and a hover effect.
The input box and the button should be aligned side by side with a 5px gap using flexbox.
How to Buy Section:
Add a section titled "How to Buy":

Background: A soft pastel blue or light gray background (bg-purple-800/80).
Add a title <h2> for the section, centered with bold text and the theme’s main color (text-yellow-300).
Inside this section, create a numbered list of steps for buying the token:

Step 1: "Create a Wallet" with instructions to download Phantom Wallet from the App Store or Google Play for mobile, or as a browser extension for desktop.
Step 2: "Get Some SOL" with details on ensuring sufficient SOL in the wallet to swap tokens.
Step 3: "Go to Pump.Fun" with instructions to visit the website, connect the wallet, and paste the token address.
Step 4: "Swap" with instructions about the swapping process and slippage settings.
Each step should include a number inside a circular background (bg-yellow-300 text-black font-bold), and the descriptions should be to the right. Use flexbox for the layout.

Ensure there is enough space between steps, use medium gray text (text-gray-300), and style each step title in bold.

Layout and Flexbox:
Add container class for layout to make all the element inside container class 
Ensure that the page layout is responsive and centered using flexbox. The content should be vertically and horizontally aligned.
The container, buttons, and input fields should be aligned and spaced appropriately using flexbox.
Styling:
Apply a playful font like 'Comic Sans MS' for the content.
Ensure all buttons and interactive elements have smooth hover transitions.
Ensure the page layout is mobile-responsive and visually appealing across devices.
Note: The page design should only use the selected theme without dark or light mode toggles, and all elements should be styled with Tailwind CSS.`

+ inputPrompt

    try {
      const { totalTokens } = await model.countTokens(inputPrompt)
      if (totalTokens > 8192) {
        this.setState({
          responseResult: this.props.t('prompt_token_limit'),
          isLoading: false
        })
      } else {
        this.setState({ lastPrompt: userPrompt, lastImgFiles: inputImages }, () => this.saveUserPromptData())
        const abortController = new AbortController()
        this.setState({ abortController: abortController })
        if (inputImages?.length > 0) {
          const imageParts = await Promise.all([...inputImages?.map(inputImg => fileToGenerativePart(inputImg))])
          const result = await model.generateContentStream([inputPrompt, ...imageParts], { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              currentImgFiles: [],
              currentImgURLs: [],
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
        } else {
          const result = await model.generateContentStream(inputPrompt, { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              currentImgFiles: [],
              currentImgURLs: [],
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
        }
        this.setState({ isGenerating: false }, () => this.saveUserResultData())
      }      
    } catch (error) {
      if (error.name !== 'AbortError') {
        Swal.fire({
          icon: 'error',
          title: this.props.t('send_prompt_fail'),
          text: `${error.message}`,
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        }).then(() => {
          if (this.state.responseResult !== '') this.saveUserResultData()
        }).finally(() => this.setState({ isLoading: false, isGenerating: false }))
      }
    }
  }

  generatePrompt() {
    history.pushState('', '', location.origin)
    try {
      this.setState({
        isLoading: true,
        lastPrompt: '',
        responseResult: '',
        isEditing: false,
        areCodesCopied: false,
        isHTMLCodeCopied: false,
        isCSSCodeCopied: false,
        isJSCodeCopied: false
      })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      if (this.state.selectedModel.isSupportSystemInstructions) {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          systemInstruction: this.props.t('system_instructions'),
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.currentPrompt, this.state.currentImgFiles)
      } else {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.currentPrompt, this.state.currentImgFiles)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: this.props.t('generate_prompt_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ isLoading: false })
    }
  }

  regeneratePrompt() {
    try {
      this.setState({
        promptId: getUserPrompt(),
        isLoading: true,
        responseResult: '',
        isEditing: false,
        areCodesCopied: false,
        isHTMLCodeCopied: false,
        isCSSCodeCopied: false,
        isJSCodeCopied: false
      })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      if (this.state.selectedModel.isSupportSystemInstructions) {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          systemInstruction: this.props.t('system_instructions'),
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.lastPrompt, this.state.lastImgFiles)
      } else {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.lastPrompt, this.state.lastImgFiles)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: this.props.t('generate_prompt_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ isLoading: false })
    }
  }

  stopPrompt() {
    if (this.state.abortController) {
      this.state.abortController.abort()
      this.setState({ isLoading: false, abortController: null, isGenerating: false })
    }
  }

  showHTMLIframe() {
    const worker = createIframeWorker()
    const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    worker.postMessage({ htmlString: normalizedResponseResult })
    worker.onmessage = workerEvent => {
      if (this.iframeRef.current) this.iframeRef.current.srcdoc = workerEvent.data
      this.scrollToBottom()
      worker.terminate()
    }
  }

  scrollToBottom() {
    if (this.state.responseResult.includes('<html')) {
      this.iframeRef.current.contentWindow.scrollTo(0, 999999)
      const codeContent = document.querySelector('.html-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
    if (this.state.responseResult.includes('<style>')) {
      const codeContent = document.querySelector('.css-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
    if (this.state.responseResult.includes('<script>')) {
      const codeContent = document.querySelector('.js-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
  }

  saveUserPromptData() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const chunkedPromptsData = this.state.chunkedPromptsData.map(chunkedPrompt => ({ ...chunkedPrompt }))
      let chunkedPrompt = this.state.lastPrompt
      if (this.state.lastPrompt.length > 50) chunkedPrompt = `${this.state.lastPrompt.slice(0, 50)}...`
      const foundChunkedPrompt = chunkedPromptsData.find(chunkedPrompt => chunkedPrompt.id === getUserPrompt())
      if (foundChunkedPrompt) {
        chunkedPromptsData[chunkedPromptsData.indexOf(foundChunkedPrompt)] = {
          id: foundChunkedPrompt.id,
          promptChunk: chunkedPrompt,
          updatedAt: new Date().toISOString()
        }
        chunkedPromptsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(chunkedPromptsData))
        if (this.loadAllPrompts() !== null) {
          const userPromptsData = this.loadAllPrompts().map(userPrompt => ({ ...userPrompt }))
          const foundUserPrompt = userPromptsData.find(userPrompt => userPrompt.id === getUserPrompt())
          if (foundUserPrompt) {
            userPromptsData[userPromptsData.indexOf(foundUserPrompt)] = {
              id: foundUserPrompt.id,
              prompt: this.state.lastPrompt
            }
          } else userPromptsData.push({ id: this.state.promptId, prompt: this.state.lastPrompt })
          localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
        } else {
          Swal.fire({
            icon: 'error',
            title: this.props.t('add_prompt_fail.0'),
            text: this.props.t('add_prompt_fail.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
        }
      } else {
        this.setState({ promptId: +new Date() }, () => {
          chunkedPromptsData.push({
            id: this.state.promptId,
            promptChunk: chunkedPrompt,
            updatedAt: (new Date()).toISOString()
          })
          chunkedPromptsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(chunkedPromptsData))
          if (this.loadAllPrompts() !== null) {
            const userPromptsData = this.loadAllPrompts().map(userPrompt => ({ ...userPrompt }))
            const foundUserPrompt = userPromptsData.find(userPrompt => userPrompt.id === getUserPrompt())
            if (foundUserPrompt) {
              userPromptsData[userPromptsData.indexOf(foundUserPrompt)] = {
                id: foundUserPrompt.id,
                prompt: this.state.lastPrompt
              }
            } else userPromptsData.push({ id: this.state.promptId, prompt: this.state.lastPrompt })
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
          } else {
            Swal.fire({
              icon: 'error',
              title: this.props.t('add_prompt_fail.0'),
              text: this.props.t('add_prompt_fail.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
          }
        })
      }
    }
  }

  saveUserResultData() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      if (this.loadAllResults() !== null) {
        const userResultsData = this.loadAllResults().map(userResult => ({ ...userResult }))
        const foundUserResult = userResultsData.find(userResult => userResult.id === getUserPrompt())
        if (foundUserResult) {
          userResultsData[userResultsData.indexOf(foundUserResult)] = {
            id: foundUserResult.id,
            result: this.state.responseResult
          }
        } else {
          userResultsData.push({ id: this.state.promptId, result: this.state.responseResult })
        }
        localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
        this.loadChunkedPrompts().then(() => this.loadPromptAndResult()).finally(() => window.history.pushState('', '', `prompt?id=${this.state.promptId}`))
      } else {
        Swal.fire({
          icon: 'error',
          title: this.props.t('add_result_fail.0'),
          text: this.props.t('add_result_fail.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
      }
    }
  }

  onEditHandler() {
    this.setState({ isEditing: true })
  }

  onCancelHandler() {
    this.setState({ isEditing: false })
  }

  toggleSidebar() {
    this.setState({ isSidebarOpened: !this.state.isSidebarOpened }, () => {
      if (this.state.isSidebarOpened) this.sortHandler(this.state.sortBy)
    })
  }

  closeSidebar() {
    this.setState({ isSidebarOpened: false, getSortedChunkedPrompts: this.state.chunkedPromptsData }, () => {
      if (this.state.promptId !== getUserPrompt()) {
        this.removeLastImages()
        if (this.state.isLoading || this.state.isGenerating) {
          if (this.state.responseResult !== '') this.saveUserResultData()
          this.stopPrompt()
        }
        this.setState({
          isEditing: false,
          currentPrompt: '',
          currentImgFiles: [],
          currentImgURLs: []
        }, () => this.loadPromptAndResult())
      }
    })
  }

  deleteAllPrompts() {
    Swal.fire({
      icon: 'warning',
      title: this.props.t('clear_all_histories.0'),
      text: this.props.t('clear_all_histories.1'),
      confirmButtonColor: 'blue',
      cancelButtonColor: "red",
      confirmButtonText: this.props.t('ok'),
      cancelButtonText: this.props.t('cancel'),
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        this.setState({
          lastPrompt: '',
          promptId: 0,
          chunkedPromptsData: [],
          getSortedChunkedPrompts: [],
          responseResult: ''
        }, () => this.closeSidebar())
      }
    })
  }

  deleteSelectedPrompt(promptId) {
    Swal.fire({
      icon: 'warning',
      title: this.props.t('clear_history.0'),
      text: this.props.t('clear_history.1'),
      confirmButtonColor: 'blue',
      cancelButtonColor: "red",
      confirmButtonText: this.props.t('ok'),
      cancelButtonText: this.props.t('cancel'),
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        const userPromptsData = this.loadAllPrompts().filter(userPrompt => userPrompt.id !== promptId)
        const userResultsData = this.loadAllResults().filter(userResult => userResult.id !== promptId)
        if (getUserPrompt() === promptId) {
          this.setState({
            lastPrompt: '',
            promptId: 0,
            chunkedPromptsData: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            getSortedChunkedPrompts: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            responseResult: ''
          }, () => {
            localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(this.state.chunkedPromptsData))
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
            localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
            history.pushState('', '', location.origin)
            })
        } else {
          this.setState({
            chunkedPromptsData: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            getSortedChunkedPrompts: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId)
          }, () => {
            localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(this.state.chunkedPromptsData))
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
            localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
          })
        }
      }
    })
  }

  copyToClipboard(languageType) {
    if (navigator.clipboard) {
      if (languageType === 'All') {
        const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
        navigator.clipboard.writeText(normalizedResponseResult)
          .then(() => this.setState({
            areCodesCopied: true,
            isHTMLCodeCopied: false,
            isCSSCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_codes_fail.0'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ areCodesCopied: false })
          })
      } else if (languageType === 'HTML') {
        const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
        const htmlOnly = normalizedResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
        navigator.clipboard.writeText(htmlOnly)
          .then(() => this.setState({
            isHTMLCodeCopied: true,
            areCodesCopied: false,
            isCSSCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_html_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isHTMLCodeCopied: false })
          })
      } else if (languageType === 'CSS') {
        const cssOnly = `${this.state.responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
        navigator.clipboard.writeText(cssOnly)
          .then(() => this.setState({
            isCSSCodeCopied: true,
            areCodesCopied: false,
            isHTMLCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_css_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isCSSCodeCopied: false })
          })
      } else if (languageType === 'JS') {
        const jsOnly = `${this.state.responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
        navigator.clipboard.writeText(jsOnly)
          .then(() => this.setState({
            isJSCodeCopied: true,
            areCodesCopied: false,
            isHTMLCodeCopied: false,
            isCSSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_js_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isJSCodeCopied: false })
          })
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: this.props.t('copy_codes_fail.0'),
        text: this.props.t('copy_codes_fail.1'),
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ areCodesCopied: false })
    }
  }

  openDownloadModal() {
    this.setState({ isDialogOpened: true })
  }

  downloadAsHTML() {
    const htmlResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    const blob = new Blob([htmlResponseResult], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'generated-index.html'
    link.click()
    this.cancelDownload()
    URL.revokeObjectURL(url)
  }

  downloadAsZip() {
    const zip = new JSZip()
    const htmlResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    const normalizedHtml = htmlResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
    const cssOnly = `${this.state.responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
    const jsOnly = `${this.state.responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
    const blob = new Blob([this.state.responseResult], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    zip.file('index.html', normalizedHtml)
    if (this.state.responseResult.includes('<style>')) zip.file('styles.css', cssOnly)
    if (this.state.responseResult.includes('<script>'))zip.file('scripts.js', jsOnly)
    zip.generateAsync({ type: 'blob' }).then(content => {
      const zipFile = new Blob([content], { type: 'application/zip' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipFile)
      link.download = 'generated-site.zip'
      link.click()
      this.cancelDownload()
      URL.revokeObjectURL(url)
    }).catch(error => {
      Swal.fire({
        icon: 'error',
        title: this.props.t('download_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
    })
  }

  saveTempWebPreview() {
    if (isStorageExist(this.props.t('browser_warning'))) {
      const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
      localStorage.setItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY, JSON.stringify(normalizedResponseResult))
    }
  }

  cancelDownload() {
    this.setState({ isDialogOpened: false })
  }

  changeTextView() {
    this.setState(prevState => ({ areTextsWrapped: !prevState.areTextsWrapped }))
  }

  render() {
    return (
      <main className="main-container h-full lg:grow w-full flex flex-col overflow-y-auto">
        <section className="grid grid-flow-row w-full lg:grid-cols-2 lg:h-full">
          <PromptContainer
            t={this.props.t}
            isDataWillBeSaved={this.props.state.isDataWillBeSaved}
            state={this.state}
            fileInputRef={this.fileInputRef}
            tempSettingInfoRef={this.tempSettingInfoRef}
            tempSettingContentInfoRef={this.tempSettingContentInfoRef}
            showTempSettingInfo={this.showTempSettingInfo.bind(this)}
            handleTempChange={this.handleTempChange.bind(this)}
            changeGeminiModel={this.changeGeminiModel.bind(this)}
            handleCurrentPromptChange={this.handleCurrentPromptChange.bind(this)}
            handleLastPromptChange={this.handleLastPromptChange.bind(this)}
            pickCurrentImages={this.pickCurrentImages.bind(this)}
            takeScreenshot={this.takeScreenshot.bind(this)}
            pickLastImages={this.pickLastImages.bind(this)}
            removeCurrentImage={this.removeCurrentImage.bind(this)}
            removeLastImages={this.removeLastImages.bind(this)}
            generatePrompt={this.generatePrompt.bind(this)}
            regeneratePrompt={this.regeneratePrompt.bind(this)}
            stopPrompt={this.stopPrompt.bind(this)}
            onEditHandler={this.onEditHandler.bind(this)}
            onCancelHandler={this.onCancelHandler.bind(this)}
            toggleSidebar={this.toggleSidebar.bind(this)}
            searchHandler={this.searchHandler.bind(this)}
            sortHandler={this.sortHandler.bind(this)}
            closeSidebar={this.closeSidebar.bind(this)}
            deleteAllPrompts={this.deleteAllPrompts.bind(this)}
            deleteSelectedPrompt={this.deleteSelectedPrompt.bind(this)}
          />
          <PreviewContainer
            t={this.props.t}
            iframeRef={this.iframeRef}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areCodesCopied={this.state.areCodesCopied}
            copyToClipboard={this.copyToClipboard.bind(this)}
            openDownloadModal={this.openDownloadModal.bind(this)}
            saveTempWebPreview={this.saveTempWebPreview.bind(this)}
          />
        </section>
        <section className="hidden grid-flow-row items-stretch w-screen md:w-full lg:grid-cols-3 lg:grow">
          <HtmlCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isHTMLCodeCopied={this.state.isHTMLCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <CssCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isCSSCodeCopied={this.state.isCSSCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <JsCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isJSCodeCopied={this.state.isJSCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
        </section>
        <UserDataEntry
          t={this.props.t}
          inputRef={this.inputRef}
          isUserDataEntered={this.props.state.isUserDataEntered}
          isFocused={this.props.state.isFocused}
          isDataWillBeSaved={this.props.state.isDataWillBeSaved}
          inputType={this.props.state.inputType}
          userName={this.props.state.userName}
          geminiApiKey={this.props.state.geminiApiKey}
          handleNameChange={this.props.handleNameChange}
          handleApiKeyChange={this.props.handleApiKeyChange}
          onFocusHandler={this.props.onFocusHandler}
          onBlurHandler={this.props.onBlurHandler}
          changeVisibilityPassword={this.props.changeVisibilityPassword}
          changeUserDataSetting={this.props.changeUserDataSetting}
          saveUserData={this.props.saveUserData}
        />
        <DownloadFileModal
          t={this.props.t}
          inputRef={this.inputRef}
          isDialogOpened={this.state.isDialogOpened}
          downloadAsHTML={this.downloadAsHTML.bind(this)}
          downloadAsZip={this.downloadAsZip.bind(this)}
          cancelDownload={this.cancelDownload.bind(this)}
        />
      </main>
    )
  }
}

export default MainContainer
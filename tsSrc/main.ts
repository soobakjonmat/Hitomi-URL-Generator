import { TagList, TagType } from "./hitomiTagList"

class Main {
    baseURL: string
    tagTypes: string[]
    localStorageName: string

    includeTagTextAreas: HTMLTextAreaElement[]
    excludeTagTextAreas: HTMLTextAreaElement[]

    generateBtn: HTMLButtonElement
    urlContainer: HTMLUListElement

    tagSelector: HTMLSelectElement
    tagListNameInput: HTMLInputElement
    saveConfirmText: HTMLDivElement

    createTagListBtn: HTMLButtonElement
    renameTagListBtn: HTMLButtonElement
    saveTagListBtn: HTMLButtonElement
    removeTagListBtn: HTMLButtonElement

    constructor() {
        this.baseURL = "https://hitomi.la/search.html?"
        this.tagTypes = ["language", "female", "male", "artist", "character", "series", "type", "tag"]
        this.localStorageName = "hitomiTagList"

        if (localStorage.getItem(this.localStorageName) == null) {
            this.initializeLocalStorage()
        }

        this.includeTagTextAreas = []
        this.excludeTagTextAreas = []

        this.appendTagContainerHeadings(<HTMLDivElement> document.getElementById("include"))
        this.appendTagContainerHeadings(<HTMLDivElement> document.getElementById("exclude"))

        this.generateBtn = <HTMLButtonElement> document.getElementById("generate-btn")
        this.urlContainer = <HTMLUListElement> document.getElementById("url-container")

        this.tagSelector = <HTMLSelectElement> document.getElementById("tag-selector")
        this.tagListNameInput = <HTMLInputElement> document.getElementById("tag-list-name-input")
        this.saveConfirmText = <HTMLDivElement> document.getElementById("save-confirm-text")

        this.createTagListBtn = <HTMLButtonElement> document.getElementById("create-tag-list-btn")
        this.renameTagListBtn = <HTMLButtonElement> document.getElementById("rename-tag-list-btn")
        this.saveTagListBtn = <HTMLButtonElement> document.getElementById("save-tag-list-btn")
        this.removeTagListBtn = <HTMLButtonElement> document.getElementById("remove-tag-list-btn")

        this.generateBtn.addEventListener("click", this.generateURL.bind(this))
        this.tagSelector.addEventListener("change", this.loadTagList.bind(this))
        this.createTagListBtn.addEventListener("click", this.createTagList.bind(this))
        this.renameTagListBtn.addEventListener("click", this.renameTagList.bind(this))
        this.saveTagListBtn.addEventListener("click", this.saveTagList.bind(this))
        this.removeTagListBtn.addEventListener("click", this.removeTagList.bind(this))

        this.appendTagOptions()
        this.loadTagList()
    }

    initializeLocalStorage() {
        localStorage.setItem(this.localStorageName, "{}")
    }

    appendTagOptions() {
        let localStorageData = this.getLocalStorageData()
        for (let tagListName in localStorageData) {
            let option = document.createElement("option")
            option.innerHTML = tagListName
            this.tagSelector.add(option)
        }
    }

    appendTagContainerHeadings(tagContainer: HTMLDivElement) {
        for (let i = 0; i < this.tagTypes.length; i++) {
            let headerDiv = document.createElement("div")
            let typeName = this.tagTypes[i]
            headerDiv.innerHTML = typeName.charAt(0).toUpperCase() + typeName.substring(1, typeName.length)

            let tagTextArea: HTMLTextAreaElement = document.createElement("textarea")
            tagTextArea.cols = 1
            tagTextArea.rows = 1

            let tagColumn = document.createElement("div")
            tagColumn.className = "tag-column"

            tagColumn.appendChild(headerDiv)
            tagColumn.appendChild(tagTextArea)
            tagContainer.appendChild(tagColumn)

            if (tagContainer.id === "include") {
                this.includeTagTextAreas.push(tagTextArea)
            } else {
                this.excludeTagTextAreas.push(tagTextArea)
            }
        }
    }

    generateURL() {
        let param = ""
        let tagType: string
        for (let i = 0; i < this.tagTypes.length; i++) {
            tagType = this.tagTypes[i]
            for (let tag of this.includeTagTextAreas[i].value.split("\n")) {
                tag = tag.trim()
                if (tag) {
                    param += tagType + "%3A" + tag.replace(/\s/g, "_") + "%20" // format: TYPE + %3A + TAG + %20
                }
            }
            for (let tag of this.excludeTagTextAreas[i].value.split("\n")) {
                tag = tag.trim()
                if (tag) {
                    param += "-" + tagType + "%3A" + tag.replace(/\s/g, "_") + "%20" // format: "-" + TYPE + %3A + TAG + %20
                }
            }
        }
        let fullURL = this.baseURL + param
        let link = document.createElement("a")
        link.href = fullURL
        link.target = "_blank"
        link.innerHTML = fullURL
        let list = document.createElement("li")
        list.appendChild(link)
        this.urlContainer.appendChild(list)
    }

    getEmptyTagType() : TagType {
        let obj: TagType = {
            language: [],
            female: [],
            male: [],
            artist: [],
            character: [],
            series: [],
            type: [],
            tag: [],
        }
        return obj
    }

    getCurrTagList() {
        let includeTags: TagType = this.getEmptyTagType()
        let excludeTags: TagType = this.getEmptyTagType()
        let tagType: string

        for (let i = 0; i < this.tagTypes.length; i++) {
            tagType = this.tagTypes[i]
            let includeTagTypes: string[] = []
            for (let tag of this.includeTagTextAreas[i].value.split("\n")) {
                if (tag.trim()) {
                    includeTagTypes.push(tag)
                }
            }
            includeTags[tagType] = includeTagTypes

            let excludeTagTypes: string[] = []
            for (let tag of this.excludeTagTextAreas[i].value.split("\n")) {
                if (tag.trim()) {
                    excludeTagTypes.push(tag)
                }
            }
            excludeTags[tagType] = excludeTagTypes
        }

        return {includeTags, excludeTags}
    }

    getLocalStorageData() : object {
        return JSON.parse(localStorage.getItem(this.localStorageName))
    }

    saveTagList() {
        if (this.tagSelector.selectedIndex === -1) {
            alert("There are no tag lists to save")
            return
        }
        let localStorageData = this.getLocalStorageData()
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value
        localStorageData[tagListName] = this.getCurrTagList()
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData))
        this.saveConfirmText.innerHTML = tagListName + " was saved successfully"
    }

    loadTagList() {
        if (this.tagSelector.selectedIndex === -1) {
            return
        }
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value
        let tagList: TagList = this.getLocalStorageData()[tagListName]
        let includeTags = tagList["includeTags"]
        let excludeTags = tagList["excludeTags"]

        let tagTextArea : HTMLTextAreaElement
        let tagContent = ""
        let i: number
        let tagStrList : string[]

        i = 0
        for (let key in includeTags) {
            tagContent = ""
            tagTextArea = this.includeTagTextAreas[i]
            tagStrList = includeTags[key]
            for (let j = 0; j < tagStrList.length; j++) {
                tagContent += tagStrList[j] + "\n"
            }
            tagTextArea.value = tagContent
            i++
        }

        i = 0
        for (let key in excludeTags) {
            tagContent = ""
            tagTextArea = <HTMLTextAreaElement> this.excludeTagTextAreas[i]
            tagStrList = excludeTags[key]
            for (let j = 0; j < tagStrList.length; j++) {
                tagContent += tagStrList[j] + "\n"
            }
            tagTextArea.value = tagContent
            i++
        }
    }

    removeTagList() {
        if(this.tagSelector.selectedIndex === -1) {
            alert("There are no tag lists to remove")
            return
        }
        let localStorageData = this.getLocalStorageData()
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value
        delete localStorageData[tagListName]
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData))
        this.tagSelector.remove(this.tagSelector.selectedIndex)
    }

    createTagList() {
        let tagListName = this.tagListNameInput.value
        if (tagListName === "") {
            alert("Please enter a tag list name")
            return
        }
        this.tagListNameInput.value = ""
        let localStorageData = this.getLocalStorageData()
        localStorageData[tagListName] = this.getCurrTagList()
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData))
        let option = document.createElement("option")
        option.innerHTML = tagListName
        this.tagSelector.add(option)
        this.tagSelector.selectedIndex = this.tagSelector.length - 1
    }

    renameTagList() {
        // get new tag list name
        let newTagListName = this.tagListNameInput.value
        if (newTagListName === "") {
            alert("There are no tag lists to rename")
            return
        }
        // delete text in input
        this.tagListNameInput.value = ""
        // get old tag list name
        let oldTagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value
        let localStorageData = this.getLocalStorageData()
        // set local storage data of old tag list to new tag list name
        localStorageData[newTagListName] = localStorageData[oldTagListName]
        // delete old tag list
        delete localStorageData[oldTagListName]
        // remove old tag list from options
        this.tagSelector.remove(this.tagSelector.selectedIndex)
        // add new tag list to options
        let option = document.createElement("option")
        option.innerHTML = newTagListName
        this.tagSelector.add(option)
        // set selectedIndex to new tag list name
        this.tagSelector.selectedIndex = this.tagSelector.length - 1
        // set local storage data
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData))
    }

}

window.onload = () => {
    new Main()
}
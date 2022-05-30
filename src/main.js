class Main {
    baseURL;
    tagTypes;
    localStorageName;
    tagContainers;
    generateBtn;
    urlContainer;
    tagSelector;
    tagListNameInput;
    createTagListBtn;
    saveTagListBtn;
    removeTagListBtn;
    constructor() {
        this.baseURL = "https://hitomi.la/search.html?";
        this.tagTypes = ["language", "female", "male", "artist", "character", "series", "type", "tag"];
        this.localStorageName = "hitomiTagList";
        if (localStorage.getItem(this.localStorageName) == null) {
            this.initializeLocalStorage();
        }
        this.tagContainers = [document.getElementById("include"), document.getElementById("exclude")];
        this.appendTagContainerHeadings(this.tagContainers[0]);
        this.appendTagContainerHeadings(this.tagContainers[1]);
        this.generateBtn = document.getElementById("generate-btn");
        this.urlContainer = document.getElementById("url-container");
        this.tagSelector = document.getElementById("tag-selector");
        this.tagListNameInput = document.getElementById("tag-list-name-input");
        this.createTagListBtn = document.getElementById("create-tag-list-btn");
        this.saveTagListBtn = document.getElementById("save-tag-list-btn");
        this.removeTagListBtn = document.getElementById("remove-tag-list-btn");
        this.generateBtn.addEventListener("click", this.generateURL.bind(this));
        this.tagSelector.addEventListener("change", this.loadTagList.bind(this));
        this.createTagListBtn.addEventListener("click", this.createTagList.bind(this));
        this.saveTagListBtn.addEventListener("click", this.saveTagList.bind(this));
        this.removeTagListBtn.addEventListener("click", this.removeTagList.bind(this));
        this.appendTagOptions();
        this.loadTagList();
    }
    initializeLocalStorage() {
        localStorage.setItem(this.localStorageName, "{}");
    }
    appendTagOptions() {
        let localStorageData = this.getLocalStorageData();
        for (let tagListName in localStorageData) {
            let option = document.createElement("option");
            option.innerHTML = tagListName;
            this.tagSelector.add(option);
        }
    }
    appendTagContainerHeadings(tagContainer) {
        for (let i = 0; i < this.tagTypes.length; i++) {
            let headerDiv = document.createElement("div");
            let typeName = this.tagTypes[i];
            headerDiv.innerHTML = typeName.charAt(0).toUpperCase() + typeName.substring(1, typeName.length);
            let tagTextArea = document.createElement("textarea");
            tagTextArea.cols = 1;
            tagTextArea.rows = 1;
            let tagColumn = document.createElement("div");
            tagColumn.className = "tag-column";
            tagColumn.appendChild(headerDiv);
            tagColumn.appendChild(tagTextArea);
            tagContainer.appendChild(tagColumn);
        }
    }
    getURLParam(div) {
        let paramStr = "";
        let tagColumn;
        let tagType;
        let tagTextArea;
        for (let i = 0; i < div.children.length; i++) {
            tagColumn = div.children[i];
            tagType = this.tagTypes[i];
            tagTextArea = tagColumn.children[1];
            if (div.id === "include") {
                for (let tag of tagTextArea.value.split("\n")) {
                    if (tag !== "") {
                        paramStr += `${tagType}%3A${tag.replace(/\s/g, "_")}%20`; //format: (-)TYPE + %3A + TAG + %20
                    }
                }
            }
            else {
                for (let tag of tagTextArea.value.split("\n")) {
                    if (tag !== "") {
                        paramStr += `-${tagType}%3A${tag.replace(/\s/g, "_")}%20`;
                    }
                }
            }
        }
        return paramStr;
    }
    generateURL() {
        let param = this.getURLParam(this.tagContainers[0]) + this.getURLParam(this.tagContainers[1]);
        let fullURL = this.baseURL + param;
        let link = document.createElement("a");
        link.href = fullURL;
        link.target = "_blank";
        link.innerHTML = fullURL;
        let list = document.createElement("li");
        list.appendChild(link);
        this.urlContainer.appendChild(list);
    }
    getEmptyTagType() {
        let obj = {
            language: [],
            female: [],
            male: [],
            artist: [],
            character: [],
            series: [],
            type: [],
            tag: [],
        };
        return obj;
    }
    getCurrTagList() {
        let includeTags = this.getEmptyTagType();
        let excludeTags = this.getEmptyTagType();
        let tagColumn;
        let tagType;
        let tagTextArea;
        // include tags
        for (let i = 0; i < this.tagContainers[0].children.length; i++) {
            tagColumn = this.tagContainers[0].children[i];
            tagType = this.tagTypes[i];
            tagTextArea = tagColumn.children[1];
            let tagList = [];
            for (let tag of tagTextArea.value.split("\n")) {
                if (tag !== "") {
                    tagList.push(tag);
                }
            }
            includeTags[tagType] = tagList;
        }
        // exclude tags
        for (let i = 0; i < this.tagContainers[1].children.length; i++) {
            tagColumn = this.tagContainers[1].children[i];
            tagType = this.tagTypes[i];
            tagTextArea = tagColumn.children[1];
            let tagList = [];
            for (let tag of tagTextArea.value.split("\n")) {
                if (tag !== "") {
                    tagList.push(tag);
                }
            }
            excludeTags[tagType] = tagList;
        }
        return { includeTags, excludeTags };
    }
    getLocalStorageData() {
        return JSON.parse(localStorage.getItem(this.localStorageName));
    }
    saveTagList() {
        let localStorageData = this.getLocalStorageData();
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value;
        localStorageData[tagListName] = this.getCurrTagList();
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData));
    }
    loadTagList() {
        if (this.tagSelector.selectedIndex === -1) {
            return;
        }
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value;
        let tagList = this.getLocalStorageData()[tagListName];
        let includeTags = tagList["includeTags"];
        let excludeTags = tagList["excludeTags"];
        let tagTextArea;
        let tagContent = "";
        let tagTypeIdx = 0;
        let tagStrList;
        for (let key in includeTags) {
            tagContent = "";
            tagTextArea = this.tagContainers[0].children[tagTypeIdx].children[1];
            tagStrList = includeTags[key];
            for (let i = 0; i < tagStrList.length; i++) {
                tagContent += tagStrList[i] + "\n";
            }
            tagTextArea.value = tagContent;
            tagTypeIdx++;
        }
        tagTypeIdx = 0;
        for (let key in excludeTags) {
            tagContent = "";
            tagTextArea = this.tagContainers[1].children[tagTypeIdx].children[1];
            tagStrList = excludeTags[key];
            for (let i = 0; i < tagStrList.length; i++) {
                tagContent += tagStrList[i] + "\n";
            }
            tagTextArea.value = tagContent;
            tagTypeIdx++;
        }
    }
    removeTagList() {
        if (this.tagSelector.selectedIndex === -1) {
            alert("There are no options to remove");
            return;
        }
        let localStorageData = this.getLocalStorageData();
        let tagListName = this.tagSelector.options[this.tagSelector.selectedIndex].value;
        delete localStorageData[tagListName];
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData));
        this.tagSelector.remove(this.tagSelector.selectedIndex);
    }
    createTagList() {
        let tagListName = this.tagListNameInput.value;
        if (tagListName === "") {
            alert("Please enter a tag name");
            return;
        }
        this.tagListNameInput.value = "";
        let localStorageData = this.getLocalStorageData();
        localStorageData[tagListName] = this.getCurrTagList();
        localStorage.setItem(this.localStorageName, JSON.stringify(localStorageData));
        let option = document.createElement("option");
        option.innerHTML = tagListName;
        this.tagSelector.add(option);
        this.tagSelector.selectedIndex = this.tagSelector.length - 1;
    }
}
window.onload = () => {
    new Main();
};
export {};

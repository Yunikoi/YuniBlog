/**
 * Created by Xiaotao.Nie on 09/04/2018.
 * Modified for Chinese TOC support on 03/29/2026.
 * All right reserved
 */

// Global functions and listeners
alert("JS已生效！");
console.log("正在运行修复版TOC脚本");
window.onresize = () => {
    if(window.document.documentElement.clientWidth > 680){
        let aboutContent = document.getElementById('nav-content')
        if (aboutContent) {
            aboutContent.classList.remove('hide-block')
            aboutContent.classList.remove('show-block');
        }
    }
    reHeightToc();
};

// Nav switch function on mobile
const navToggle = document.getElementById('site-nav-toggle');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        let aboutContent = document.getElementById('nav-content')
        if (!aboutContent.classList.contains('show-block')) {
            aboutContent.classList.add('show-block');
            aboutContent.classList.remove('hide-block')
        } else {
            aboutContent.classList.add('hide-block')
            aboutContent.classList.remove('show-block');
        }
    })
}

// Global search logic
const searchButton = document.getElementById('search')
const searchField = document.getElementById('search-field')
const searchInput = document.getElementById('search-input')
const searchResultContainer = document.getElementById('search-result-container')
const escSearch = document.getElementById('esc-search')
const bgSearch = document.getElementById('search-bg')
const beginSearch = document.getElementById('begin-search')

if (searchField) {
    searchField.addEventListener('mousewheel',(e) => {
        e.stopPropagation()
        return false
    }, false)
}

var searchJson;
var caseSensitive = false

if (searchButton) {
    searchButton.addEventListener('click', () => {
        search()
    });
}

if (escSearch) escSearch.addEventListener('click',() => hideSearchField())
if (bgSearch) bgSearch.addEventListener('click',() => hideSearchField())
if (beginSearch) {
    beginSearch.addEventListener('click',() => {
        let keyword = searchInput.value;
        if(keyword) searchFromKeyWord(keyword)
    })
}

function toggleSeachField(){
    if (!searchField.classList.contains('show-flex-fade')) {
        showSearchField()
    } else {
        hideSearchField()
    }
}

function showSearchField() {
    searchInput.focus()
    searchField.classList.add('show-flex-fade');
    searchField.classList.remove('hide-flex-fade');
}

function hideSearchField(){
    window.onkeydown = null;
    searchField.classList.add('hide-flex-fade');
    searchField.classList.remove('show-flex-fade');
}

function searchFromKeyWord(keyword = ""){
    let result = [];
    let sildeWindowSize = 100;
    let handleKeyword = caseSensitive ? keyword : keyword.toLowerCase();

    if(!searchJson) return -1;

    searchJson.forEach((item) => {
        if(!item.title || !item.content) return;
        let title = item.title
        let content = item.content.trim().replace(/<[^>]+>/g,"").replace(/[`#\n]/g,"");
        let lowerTitle = caseSensitive ? title : title.toLowerCase();
        let lowerContent = caseSensitive ? content : content.toLowerCase();

        if(lowerTitle.indexOf(handleKeyword) !== -1 || lowerContent.indexOf(handleKeyword) !== -1){
            let resultItem = {
                title: title.replace(new RegExp(keyword, 'g'), "<span class='red'>" + keyword + '</span>'),
                url: item.url,
                content: []
            };
            let lastend = 0
            while(lowerContent.indexOf(handleKeyword) !== -1){
                let index = lowerContent.indexOf(handleKeyword);
                let begin = index - sildeWindowSize / 2 < 0 ? 0 : index - sildeWindowSize / 2
                let end = begin + sildeWindowSize;
                let reg = new RegExp('('+keyword+')', caseSensitive ? 'g' : 'ig');
                resultItem.content.push("..." + content.slice(lastend + begin, lastend + end).replace(reg, "<span class='red'>$1</span>") + "...")
                lowerContent = lowerContent.slice(end);
                lastend += end
            }
            result.push(resultItem)
        }
    })

    if(!result.length){
        searchResultContainer.innerHTML = `<div class="no-search-result">No Result</div>`;
        return;
    }

    let searchFragment = document.createElement('ul')
    for(let item of result){
        let searchItem = document.createElement('li');
        let searchTitle = document.createElement('a');
        searchTitle.href = item.url
        searchTitle.innerHTML = item.title;
        searchItem.appendChild(searchTitle)
        if(item.content.length) {
            let searchContentLiContainer = document.createElement('ul')
            for (let citem of item.content) {
                let searchContentFragment = document.createElement('li')
                searchContentFragment.innerHTML = citem;
                searchContentLiContainer.appendChild(searchContentFragment)
            }
            searchItem.appendChild(searchContentLiContainer)
        }
        searchFragment.appendChild(searchItem)
    }
    searchResultContainer.innerHTML = '';
    searchResultContainer.appendChild(searchFragment)
}

function search(){
    toggleSeachField()
    window.onkeydown = (e) => {
        if (e.which === 27) toggleSeachField()
        else if(e.which === 13){
            let keyword = searchInput.value;
            if(keyword) searchFromKeyWord(keyword)
        }
    }

    if(!searchJson){
        let search_path = window.hexo_search_path || "search.json";
        let path = window.hexo_root + search_path;
        $.ajax({
            url: path,
            dataType: "json",
            async: true,
            success: function (res) { searchJson = res; }
        });
    }
}

// TOC (Directory) logic
function getDistanceOfLeft(obj) {
    let left = 0, top = 0;
    while (obj) {
        left += obj.offsetLeft;
        top += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return { left, top };
}

var toc = document.getElementById('toc')
var tocToTop = toc ? getDistanceOfLeft(toc).top : 0;

function reHeightToc(){
    if(toc) {
        toc.style.maxHeight = (document.documentElement.clientHeight - 10) + 'px';
        toc.style.overflowY = 'scroll';
    }
}

reHeightToc();

if(window.isPost && toc){
    var result = []
    var nameSet = new Set();

    if(toc.children && toc.children[0] && toc.children[0].nodeName === "OL") {
        let ol = Array.from(toc.children[0].children)

        function getArrayFromOl(ol) {
            let res = []
            ol.forEach((item) => {
                if (item.children.length >= 1) {
                    let href = item.children[0].getAttribute('href');
                    if (href) {
                        let value = href.replace(/^#/, "");
                        nameSet.add(value);
                        let itemData = { value: [value], dom: item };

                        if (item.children.length > 1 && item.children[1].nodeName === "OL") {
                            let concatArray = getArrayFromOl(Array.from(item.children[1].children));
                            itemData.value = itemData.value.concat(concatArray.reduce((p, n) => p.concat(n.value), []));
                            res.push(itemData);
                            res = res.concat(concatArray);
                        } else {
                            res.push(itemData);
                        }
                    }
                }
            })
            return res
        }
        result = getArrayFromOl(ol)
    }

    var nameArray = Array.from(nameSet)

    function reLayout() {
        let scrollToTop = document.documentElement.scrollTop || window.pageYOffset
        if(tocToTop === 0 && toc) {
            tocToTop = getDistanceOfLeft(toc).top;
        }
        if (toc) {
            if (tocToTop <= scrollToTop + 10) toc.classList.add('toc-fixed')
            else toc.classList.remove('toc-fixed')
        }

        let minTop = 9999;
        let minTopsValue = ""

        for (let item of nameArray) {
            // 核心修复：解码 URI，确保能找到中文 ID 的 DOM 元素
            let decodedId = decodeURIComponent(item);
            let dom = document.getElementById(decodedId) || document.getElementById(item);

            if (!dom) continue;
            let toTop = getDistanceOfLeft(dom).top - scrollToTop;

            if (Math.abs(toTop) < minTop) {
                minTop = Math.abs(toTop)
                minTopsValue = item
            }
        }

        if (minTopsValue) {
            result.forEach(item => {
                if (item.value.indexOf(minTopsValue) !== -1) item.dom.classList.add("active")
                else item.dom.classList.remove("active")
            })
        }
    }

    reLayout()
    window.addEventListener('scroll', reLayout)
}

// Donate logic
const donateButton = document.getElementById('donate-button')
const donateImgContainer = document.getElementById('donate-img-container')
const donateImg = document.getElementById('donate-img')

if(donateButton && donateImgContainer) {
    donateButton.addEventListener('click', () => {
        donateImgContainer.classList.toggle('hide')
    })
    if (donateImg) donateImg.src = donateImg.dataset.src
}
// 强制修复中文锚点跳转补丁
document.addEventListener('click', function (e) {
    let target = e.target;
    // 判断点击的是不是目录里的链接
    if (target.tagName === 'A' && target.getAttribute('href').startsWith('#')) {
        const rawHref = target.getAttribute('href').slice(1);
        const decodedHref = decodeURIComponent(rawHref);

        // 尝试用“原始编码”和“解码后”的 ID 去找元素
        const targetElement = document.getElementById(decodedHref) ||
            document.getElementById(rawHref) ||
            document.querySelector(`[id="${decodedHref}"]`);

        if (targetElement) {
            e.preventDefault(); // 阻止浏览器默认的（可能失败的）跳转
            console.log("正在强制跳转到:", decodedHref);
            window.scrollTo({
                top: targetElement.offsetTop - 20, // 稍微留点页边距
                behavior: 'smooth' // 平滑滚动
            });
        }
    }
}, true); // 使用捕获模式，确保优先级最高
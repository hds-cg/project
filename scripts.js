// 用数组存储每个图片容器的当前图片索引和初始加载状态
let currentImageIndex = [];
let isInitialLoad = [];

// 使用常量定义配置参数
const CONFIG = {
    ANIMATION_DURATION: 400, // 改为1000匹配transition时间
    SCROLL_SPEED: 0.01,
    TRANSITION: 'transform 0.4s ease-out' // 添加统一的transition配置
};

// 修改选择器以包含所有图片容器
const imageContainers = document.querySelectorAll('.image-container, .image-container2, .image-container3, .image-container4, .image-container5');

// 遍历图片容器，初始化状态
imageContainers.forEach(() => {
    currentImageIndex.push(0);
    isInitialLoad.push(true);
});

// 优化图片轮播逻辑
function showImage(containerIndex, index, direction = 'right') {
    const container = imageContainers[containerIndex];
    const images = container.querySelectorAll('img');
    const currentImg = images[currentImageIndex[containerIndex]];
    const nextImg = images[index];
    
    // 初始加载时不使用动画
    if (isInitialLoad[containerIndex]) {
        nextImg.style.display = 'block';
        currentImageIndex[containerIndex] = index;
        updateCounter(containerIndex, images.length, index);
        isInitialLoad[containerIndex] = false;
        return;
    }
    
    // 设置初始位置
    nextImg.style.display = 'block';
    nextImg.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
    
    // 触发重排以确保过渡效果
    requestAnimationFrame(() => {
        // 设置过渡效果
        currentImg.style.transition = CONFIG.TRANSITION;
        nextImg.style.transition = CONFIG.TRANSITION;
        
        // 同时移动两张图片
        currentImg.style.transform = `translateX(${direction === 'right' ? '-100%' : '100%'})`;
        nextImg.style.transform = 'translateX(0)';
        
        // 使用transitionend事件
        nextImg.addEventListener('transitionend', function onTransitionEnd() {
            images.forEach((img, i) => {
                if (i !== index) {
                    img.style.display = 'none';
                    img.style.transform = '';
                    img.style.transition = '';
                }
            });
            updateCounter(containerIndex, images.length, index);
            nextImg.removeEventListener('transitionend', onTransitionEnd);
        }, { once: true });
    });
    
    // 更新当前索引
    currentImageIndex[containerIndex] = index;
}

function updateCounter(containerIndex, totalImages, currentIndex) {
    const counter = imageContainers[containerIndex].querySelector('.image-counter');
    if (counter) {
        counter.textContent = `${currentIndex + 1}/${totalImages}`;
    }
}

// 为每个图片容器添加交互逻辑
imageContainers.forEach((container, containerIndex) => {
    let isFirstMove = true;
    
    // 初始化计数器状态
    const counter = container.querySelector('.image-counter');
    if (counter) {
        counter.style.opacity = '0';
        counter.style.display = 'none';
        counter.style.transition = 'opacity 0.3s';
    }

    // 初始化显示第一张图片
    showImage(containerIndex, currentImageIndex[containerIndex]);

    // 鼠标移动时的交互
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        if (counter) {
            const x = e.clientX - rect.left - (counter.offsetWidth / 2);
            const y = e.clientY - rect.top - (counter.offsetHeight / 2);
            
            if (isFirstMove) {
                counter.style.left = `${x}px`;
                counter.style.top = `${y}px`;
                counter.style.display = 'block';
                requestAnimationFrame(() => {
                    counter.style.opacity = '1';
                });
                isFirstMove = false;
            } else {
                counter.style.left = `${x}px`;
                counter.style.top = `${y}px`;
            }
            container.style.cursor = 'none';
        }
    });

    // 鼠标离开容器时的交互
    container.addEventListener('mouseleave', () => {
        if (counter) {
            counter.style.opacity = '0';
            counter.style.display = 'none';
            container.style.cursor = 'auto';
            isFirstMove = true;
        }
    });

    // 点击计数器切换到下一张图片
    if (counter) {
        counter.addEventListener('click', () => {
            currentImageIndex[containerIndex] = (currentImageIndex[containerIndex] + 1) % container.querySelectorAll('img').length;
            showImage(containerIndex, currentImageIndex[containerIndex]);
        });
    }

    // 修改点击事件处理
    container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        const images = container.querySelectorAll('img');
        let newIndex, direction;
        
        if (e.clientX - rect.left < rect.width / 2) {
            // 左侧点击 - 上一张
            newIndex = currentImageIndex[containerIndex] - 1;
            if (newIndex < 0) {
                newIndex = images.length - 1;
            }
            direction = 'left';
        } else {
            // 右侧点击 - 下一张
            newIndex = (currentImageIndex[containerIndex] + 1) % images.length;
            direction = 'right';
        }
        
        showImage(containerIndex, newIndex, direction);
    });

});

// 为工作经历部分添加交互逻辑
document.querySelector('.collapse-btn').addEventListener('click', function() {
    const content = document.querySelector('.experience-content');
    const state = this.querySelector('.state');
    const divider = document.querySelector('.experience-divider');
    
    content.classList.toggle('active');
    divider.classList.toggle('active');
    state.textContent = content.classList.contains('active') ? ':-D' : ':-I';
});

// 文字滚动效果
function initMarquee() {
    const marquees = document.querySelectorAll('.marquee');

    marquees.forEach(marquee => {
        const inner = marquee.querySelector('.marquee_inner');
        const text = inner.textContent.trim();

        // 清空原有内容
        inner.textContent = '';

        // 创建三个文本块（原始 + 克隆）
        const textBlocks = [];
        for (let i = 0; i < 3; i++) {
            const textBlock = document.createElement('span');
            textBlock.className = 'marquee_text';
            textBlock.textContent = text + ' '; // 添加空格分隔
            textBlock.style.display = 'inline-block';
            textBlock.style.whiteSpace = 'nowrap';
            inner.appendChild(textBlock);
            textBlocks.push(textBlock);
        }

        // 强制重新计算布局
        inner.getBoundingClientRect();

        // 获取单个文本块的实际宽度（包含空格）
        const textWidth = textBlocks[0].getBoundingClientRect().width;

        let translateX = 0;
        const speed = 1.5; // 滚动速度

        function animate() {
            translateX -= speed;

            // 当第一个文本块即将完全移出视图时
            if (Math.abs(translateX) >= textWidth) {
                // 将第一个文本块移动到最后
                const firstBlock = textBlocks.shift();
                inner.appendChild(firstBlock);
                textBlocks.push(firstBlock);

                // 调整 translateX 以抵消位移
                translateX += textWidth;
            }

            inner.style.transform = `translateX(${translateX}px)`;
            requestAnimationFrame(animate);
        }

        // 启动动画
        requestAnimationFrame(animate);
    });
}

// 初始化滚动效果
document.addEventListener('DOMContentLoaded', initMarquee);

function setupInfiniteScroll() {
    const wrapper = document.querySelector('.index-list-wrapper');
    const list = document.querySelector('.index-list');

    // 克隆两份列表
    const clone1 = list.cloneNode(true);
    const clone2 = list.cloneNode(true);
    clone1.classList.add('index-list-clone-1');
    clone2.classList.add('index-list-clone-2');

    wrapper.appendChild(clone1);
    wrapper.appendChild(clone2);

    let isPaused = false;
    const speed = 1.5; // 滚动速度
    let translateY = 0;

    // 设置初始位置
    list.style.transform = `translateY(0px)`;
    clone1.style.transform = `translateY(${list.offsetHeight}px)`;
    clone2.style.transform = `translateY(${list.offsetHeight * 2}px)`;

    function animate() {
        if (!isPaused) {
            translateY -= speed;

            if (translateY <= -list.offsetHeight) {
                translateY = 0; // 关键：让它无缝回到顶部
            }

            list.style.transform = `translateY(${translateY}px)`;
            clone1.style.transform = `translateY(${translateY + list.offsetHeight}px)`;
            clone2.style.transform = `translateY(${translateY + list.offsetHeight * 2}px)`;
        }

        requestAnimationFrame(animate);
    }

    // 立即开始动画
    animate();

    // 鼠标悬停时暂停滚动
    wrapper.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    wrapper.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    // 替换旧的点击处理逻辑
    function handleIndexClick(e) {
        const indexItem = e.target.closest('.index-item');
        if (!indexItem) return;
        
        const items = Array.from(document.querySelectorAll('.index-item'));
        const targetIndex = items.indexOf(indexItem) % 10; // 获取原始列表中的索引
        
        scrollToProject(targetIndex);
    }

    // 为原始列表和克隆列表添加点击事件（保留事件委托）
    list.addEventListener('click', handleIndexClick);
    clone1.addEventListener('click', handleIndexClick);
    clone2.addEventListener('click', handleIndexClick);
}

// 等待 DOM 结构加载完成后运行
document.addEventListener("DOMContentLoaded", setupInfiniteScroll);

// 添加错误处理
function handleError(error) {
    console.error('An error occurred:', error);
}

// 使用事件委托优化事件监听
document.addEventListener('click', function(e) {
    if (e.target.matches('.collapse-btn')) {
        // 折叠按钮逻辑
    }
}, false);

// 在文件末尾添加以下代码
// 项目定位功能
function scrollToProject(index) {
    const project = document.querySelector('.project');
    const projects = document.querySelectorAll('.project-content');
    const titleBar = project.querySelector('.title-bar');
    const targetProject = projects[index];
    
    if(targetProject) {
        // 计算目标位置（减去标题栏高度）
        const titleBarHeight = titleBar.offsetHeight;
        const targetPosition = targetProject.offsetTop - titleBarHeight;
        
        // 滚动到目标位置
        project.scrollTo({ 
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // 添加动态高亮效果
        targetProject.style.opacity = '0';
        targetProject.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            targetProject.style.transition = 'all 1s ease';
            targetProject.style.opacity = '1';
            targetProject.style.transform = 'translateY(0)';
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    setupInfiniteScroll();
    initMarquee();
    setupInfoToggle();
    setupInfoHeight();
    setupTouchHandling();
    setupScrollBehavior(); 
    
    // 删除原独立的内容加载监听器（约第361行和471行）
});

// 添加标题点击返回功能
function scrollProjectToTop() {
    document.querySelector('.project').scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setupInfoToggle() {
    const toggleBtn = document.querySelector('.toggle-info-text');
    const projectContents = document.querySelectorAll('.project-content');

    if (!toggleBtn) {
        console.error('Toggle button not found.');
        return;
    }

    let isInfoVisible = true;

    toggleBtn.addEventListener('click', () => {
        isInfoVisible = !isInfoVisible;
        
        // 更新按钮文字
        toggleBtn.textContent = isInfoVisible ? 'Mode_Normal_:-I' : 'Mode_Medium_:-D';

        // 遍历所有 project-content
        projectContents.forEach(content => {
            const info = content.querySelector('.info');
            const images = content.querySelector('.project-images');
            const marquee = content.querySelector('.marquee');

            if (info && images && marquee) {
                if (isInfoVisible) {
                    info.classList.remove('hidden');
                    images.classList.remove('expanded');
                    marquee.classList.remove('hidden');
                } else {
                    info.classList.add('hidden');
                    images.classList.add('expanded');
                    marquee.classList.add('hidden');
                }
            }
        });
    });
}


function setupInfoHeight() {
    const projectContents = document.querySelectorAll('.project-content');

    function updateInfoHeight() {
        projectContents.forEach(content => {
            const info = content.querySelector('.info');
            const imageContainer = content.querySelector('.project-images');
            const activeImage = imageContainer.querySelector('img:first-child'); // 获取第一张图片作为参考

            if (info && activeImage) {
                // 等待图片加载完成
                if (activeImage.complete) {
                    const imageHeight = imageContainer.offsetHeight;
                    // 将 3rem 转换为像素（假设 1rem = 16px，则 3rem = 48px）
                    const heightOffset = 48; // 3rem
                    info.style.height = `${imageHeight - heightOffset}px`;
                    info.style.overflowY = 'auto';
                } else {
                    activeImage.addEventListener('load', () => {
                        const imageHeight = imageContainer.offsetHeight;
                        const heightOffset = 48; // 3rem
                        info.style.height = `${imageHeight - heightOffset}px`;
                        info.style.overflowY = 'auto';
                    });
                }
            }
        });
    }

    // 初始更新
    updateInfoHeight();

    // 监听窗口大小变化
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // 使用防抖来避免频繁更新
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateInfoHeight, 100);
    });
}

function updateExperienceHeight() {
    const intro = document.querySelector('.intro');
    const titleBar = intro.querySelector('.title-bar');
    const contactBox = intro.querySelector('.contact-info-box');
    const experienceWrapper = intro.querySelector('.experience-wrapper');
    
    // 计算可用高度
    const availableHeight = intro.clientHeight - 
                          titleBar.offsetHeight - 
                          contactBox.offsetHeight - 
                          30; // 减去一些边距
    
    // 设置高度
    experienceWrapper.style.height = `${availableHeight}px`;
}

// 在页面加载和窗口调整时更新高度
window.addEventListener('load', updateExperienceHeight);
window.addEventListener('resize', updateExperienceHeight);

function setupScrollBehavior() {
    const intro = document.querySelector('.intro');
    const project = document.querySelector('.project');
    const experienceWrapper = intro.querySelector('.experience-wrapper');
    
    // 阻止滚动事件冒泡
    experienceWrapper.addEventListener('wheel', (e) => {
        e.stopPropagation();
        // 检查是否达到滚动边界
        const { scrollTop, scrollHeight, clientHeight } = experienceWrapper;
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        
        if ((isScrollingUp && scrollTop === 0) || 
            (isScrollingDown && scrollTop + clientHeight >= scrollHeight)) {
            e.preventDefault();
        }
    });

    // 阻止 project 区域的滚动影响其他区域
    project.addEventListener('wheel', (e) => {
        e.stopPropagation();
    });

    // 禁用 intro 区域的整体滚动
    intro.addEventListener('wheel', (e) => {
        if (!experienceWrapper.contains(e.target)) {
            e.preventDefault();
        }
    });
}

window.addEventListener('resize', () => {
    updateExperienceHeight();
});


// 优化后的触摸处理
function setupTouchHandling() {
    const projectContainer = document.querySelector('.project');
    let startY = 0;
    let startTime = 0;
    let lastY = 0;
    let velocity = 0;

    projectContainer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        lastY = startY;
        startTime = Date.now();
        
        // 停止所有正在进行的动画
        projectContainer.style.transition = 'none';
    }, { passive: true });

    projectContainer.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;
        const currentTime = Date.now();
        const dt = currentTime - startTime;
        
        // 计算滑动速度
        velocity = (lastY - currentY) / dt;
        lastY = currentY;
        
        // 检查滚动边界
        const atTop = projectContainer.scrollTop <= 0;
        const atBottom = projectContainer.scrollTop + projectContainer.clientHeight >= projectContainer.scrollHeight;
        
        if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
            projectContainer.style.overflow = 'hidden';
        } else {
            projectContainer.style.overflow = 'scroll';
            projectContainer.scrollTop += deltaY * 1.2; // 调整滚动灵敏度
        }
    }, { passive: true });

    projectContainer.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const deltaY = endY - startY;
        const deltaTime = Date.now() - startTime;
        
        // 恢复正常滚动状态
        projectContainer.style.overflow = 'scroll';
        projectContainer.style.transition = '';

        // 计算惯性滚动
        if (Math.abs(deltaY) > 20 && deltaTime < 300) {
            const momentum = velocity * 800; // 调整惯性系数
            projectContainer.scrollBy({
                top: momentum,
                behavior: 'smooth'
            });
        }
    }, { passive: true });
}

// 防止整个页面的滚动穿透
document.body.addEventListener('touchmove', (e) => {
    if (!e.target.closest('.project')) {
        e.preventDefault();
    }
}, { passive: false });

// 优化滚动性能
const projectContainer = document.querySelector('.project');
if (projectContainer) {
    projectContainer.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            // 处理滚动相关的视觉更新
        });
    }, { passive: true });
}

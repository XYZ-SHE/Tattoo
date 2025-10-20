// script.js

// 等待 HTML 页面完全加载后，再运行我们的代码
// 这是一个非常好的习惯，可以防止 JS 找不到 HTML 元素
document.addEventListener('DOMContentLoaded', function() {
    
    // ===============================================
    // ==== 0. 获取所有需要用到的 HTML 元素 ====
    // ===============================================

    // --- 通用页面元素 ---
    var welcomePage = document.getElementById('welcome-page');
    var consultationPage = document.getElementById('consultation-page');
    var arPage = document.getElementById('ar-page');
    var summaryPage = document.getElementById('summary-page');
    
    // --- 步骤 1 & 2 的元素 ---
    var fileInput = document.getElementById('file-upload');
    var tattooPreviewImage = document.getElementById('tattoo-preview-image');
    var questionText = document.getElementById('question-text');
    var answerInput = document.getElementById('answer-input');
    var progressBar = document.getElementById('progress-bar');
    var nextBtn = document.getElementById('next-btn');
    
    // --- 步骤 3 (AR) 的元素 ---
    var webcamFeed = document.getElementById('webcam-feed');
    var draggableImage = document.getElementById('draggable-tattoo-image');
    var arControls = document.getElementById('ar-controls');
    var initialReflectionContent = document.getElementById('initial-reflection-content');
    var futureReflectionContent = document.getElementById('future-reflection-content');
    var tryonDoneBtn = document.getElementById('tryon-done-btn');
    var scaleSlider = document.getElementById('scale-slider');
    var rotateSlider = document.getElementById('rotate-slider');
    var filterButtonsContainer = document.getElementById('filter-buttons');
    var finishBtn = document.getElementById('finish-btn');
    
    // --- 步骤 4 (总结) 的元素 ---
    var summaryImage = document.getElementById('summary-image');
    var summaryAnswersContainer = document.getElementById('summary-answers-container');
    var summaryFutureChoice = document.getElementById('summary-future-choice');
    var printBtn = document.getElementById('print-btn');

    // ===============================================
    // ==== 1. 存储数据和状态的变量 ====
    // ===============================================

    // 所有要问的问题
    var questions = [
        "This design is cool. What's the story behind it? Or just, what made you land on this?", 
        "Did something specific happen that made you decide 'now is the time' to get it?", 
        "Got a spot in mind?... Okay, with that placement, are you hoping it's seen all the time, or is it more just for you?", 
        "Are you hoping this piece will... I don't know, remind you of something down the line? Or give you a bit of strength?", 
        "Last one, and it's a bit of a deep cut: Have you thought about 20 years from now... what will you feel when you look at this tattoo?"
    ];
    
    // 总结页面用的问题标签
    var questionLabels = [
        "Design Story & Motivation", 
        "The Timing", 
        "Placement & Visibility", 
        "Expectation & Purpose", 
        "Thoughts on the Future"
    ];

    // 用来跟踪进度的变量
    var currentQuestionIndex = 0;
    var userAnswers = []; // 一个数组，用来存放所有的回答
    var futureChoice = "";
    var uploadedImageURL = '';
    var webcamStream = null; // 用来存放摄像头视频流

    // ===============================================
    // ==== 2. 通用功能 (页面切换) ====
    // ===============================================

    // 一个函数，用来隐藏所有页面，然后只显示我们想要的那个
    function showPage(pageToShow) {
        // 先把所有页面都藏起来
        welcomePage.classList.add('hidden');
        consultationPage.classList.add('hidden');
        arPage.classList.add('hidden');
        summaryPage.classList.add('hidden');
        
        // 再显示我们想要的那一个
        pageToShow.classList.remove('hidden');
    }

    // ===============================================
    // ==== 3. 步骤 1 & 2: 欢迎和咨询的逻辑 ====
    // ===============================================

    // (步骤 1) 监听文件上传
    fileInput.addEventListener('change', function(e) {
        // 确保用户真的选了一个文件
        if (e.target.files[0]) {
            var reader = new FileReader(); // 创建一个文件读取器
            
            // 当读取器加载完文件后
            reader.onload = function(e) {
                uploadedImageURL = e.target.result; // 保存图片的地址
                
                // 把这个图片放到所有需要它的地方
                tattooPreviewImage.src = uploadedImageURL;
                draggableImage.src = uploadedImageURL;
                summaryImage.src = uploadedImageURL;
                
                // (进入步骤 2) 开始咨询
                startConsultation();
            };
            
            // 让读取器开始读取文件
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // (步骤 2) 开始咨询的功能
    function startConsultation() {
        showPage(consultationPage); // 切换到咨询页面
        currentQuestionIndex = 0; // 重置问题索引
        userAnswers = []; // 清空之前的回答
        displayCurrentQuestion(); // 显示第一个问题
        updateImageClarity(); // 更新图片模糊度
    }
    
    // (步骤 2) 显示当前问题
    function displayCurrentQuestion() {
        questionText.style.opacity = 0; // 先让旧问题淡出
        
        // 等 500 毫秒，再让新问题淡入
        setTimeout(function() {
            // 更新问题文本
            questionText.innerHTML = '<strong>[ Question ' + (currentQuestionIndex + 1) + '/' + questions.length + ' ]</strong><br>' + questions[currentQuestionIndex];
            questionText.style.opacity = 1;
        }, 500);
        
        // 禁用“继续”按钮，直到用户输入内容
        nextBtn.disabled = true; 
    }
    
    // (步骤 2) 更新图片清晰度 和 进度条
    function updateImageClarity() {
        var progress = currentQuestionIndex / questions.length; // 计算进度 (0 到 1)
        var blurValue = (1 - progress) * 25; // 进度越高，模糊越少
        var opacityValue = 0.2 + (progress * 0.8); // 进度越高，透明度越低
        
        tattooPreviewImage.style.filter = 'blur(' + blurValue + 'px) opacity(' + opacityValue + ')';
        progressBar.style.width = (progress * 100) + '%';
    }
    
    // (步骤 2) 监听输入框，用户输入时才启用按钮
    answerInput.addEventListener('input', function() {
        // .trim() 是去掉前后的空格
        if (answerInput.value.trim() === '') {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    });

    // (步骤 2) 当“继续”按钮被点击时
    nextBtn.addEventListener('click', function() {
        userAnswers.push(answerInput.value); // 保存用户的回答
        answerInput.value = ''; // 清空输入框
        currentQuestionIndex++; // 问题索引 +1
        
        // 检查是否还有更多问题
        if (currentQuestionIndex < questions.length) {
            // 还有问题，就显示下一个问题
            displayCurrentQuestion();
            updateImageClarity();
        } else {
            // (步骤 2 结束) 没有更多问题了
            progressBar.style.width = '100%';
            tattooPreviewImage.style.filter = 'blur(0px) opacity(1)'; // 图片完全清晰
            questionText.style.opacity = 0;
            
            // 显示一个总结信息
            setTimeout(function() {
                questionText.innerHTML = "<strong>Okay, it really sounds like you've thought this through. That's awesome.</strong><br><br>Before we book the appointment, let's do one last thing—let's see how it actually looks on you.";
                questionText.style.opacity = 1;
            }, 500);
            
            // 隐藏不再需要的元素
            answerInput.style.display = 'none';
            progressBar.parentElement.style.display = 'none';
            
            // 更改按钮的文字和功能，准备进入步骤3
            nextBtn.textContent = '[ Start AR Try-On ]';
            nextBtn.disabled = false;
            nextBtn.onclick = startARSimulation; // 点击后将调用 AR 功能
        }
    });

    // ===============================================
    // ==== 4. 步骤 3: AR 试穿的逻辑 ====
    // ===============================================

    // (步骤 3) 启动 AR 模拟
    function startARSimulation() {
        showPage(arPage); // 切换到 AR 页面
        
        // 如果之前打开过摄像头，先关掉
        if (webcamStream) {
            webcamStream.getTracks().forEach(function(track) { track.stop(); });
            webcamStream = null;
        }
        
        // 尝试获取用户的摄像头
        // navigator.mediaDevices.getUserMedia 返回一个 Promise
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(function(stream) {
                // 成功获取到摄像头！
                webcamStream = stream; // 保存视频流
                webcamFeed.srcObject = stream;
                
                // 显示 AR 控件和初始说明
                arControls.classList.remove('hidden');
                initialReflectionContent.classList.remove('hidden'); 
                futureReflectionContent.classList.add('hidden'); // 隐藏“未来”问题
                finishBtn.classList.add('hidden'); // 隐藏“完成”按钮
            })
            .catch(function(err) {
                // 获取失败了
                console.error("无法访问摄像头: ", err); 
                alert("无法访问你的摄像头。请检查你的浏览器权限设置，然后刷新页面。"); 
            });
    }

    // --- (步骤 3) 拖拽、缩放、旋转的变量和功能 ---
    var isDragging = false, currentX = 0, currentY = 0, initialX = 0, initialY = 0, currentScale = 1, currentRotation = 0;

    // 拖拽开始 (鼠标按下或手指触摸)
    function dragStart(e) {
        // 判断是触摸还是鼠标
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - currentX;
            initialY = e.touches[0].clientY - currentY;
        } else {
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        }
        
        // 只有点在纹身图片上才开始拖拽
        if (e.target === draggableImage) {
            isDragging = true;
        }
    }
    
    // 拖拽结束 (鼠标松开或手指离开)
    function dragEnd() {
        isDragging = false;
    }
    
    // 拖拽中 (鼠标移动或手指滑动)
    function drag(e) {
        if (isDragging) {
            e.preventDefault(); // 阻止页面滚动
            
            // 同样，判断是触摸还是鼠标
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            updateTattooTransform(); // 更新图片位置
        }
    }

    // (步骤 3) 统一更新纹身图片的位置、缩放和旋转
    function updateTattooTransform() {
        draggableImage.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0) scale(' + currentScale + ') rotate(' + currentRotation + 'deg)';
    }

    // --- (步骤 3) 绑定所有 AR 控件的事件 ---
    
    // 鼠标拖拽事件
    draggableImage.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    
    // 触摸拖拽事件
    draggableImage.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });

    // 缩放滑块
    scaleSlider.addEventListener('input', function(e) {
        currentScale = parseFloat(e.target.value) / 150; // 把滑块的值 (20-400) 转换成缩放比例
        updateTattooTransform();
    });
    
    // 旋转滑块
    rotateSlider.addEventListener('input', function(e) {
        currentRotation = parseInt(e.target.value);
        updateTattooTransform();
    });

    
    // (步骤 3) 当用户点击 "[ I've got the spot ]" 按钮
    tryonDoneBtn.addEventListener('click', function() {
        arControls.classList.add('hidden'); // 隐藏控件
        initialReflectionContent.classList.add('hidden'); // 隐藏说明
        futureReflectionContent.classList.remove('hidden'); // 显示“未来”问题
    });
    
    // (步骤 3) 当用户点击“未来”选项按钮
    filterButtonsContainer.addEventListener('click', function(e) {
        // 确保点的是一个按钮
        if (e.target.tagName === 'BUTTON') {
            futureChoice = e.target.dataset.choice; // 获取按钮上 data-choice 的值
            
            draggableImage.className = ""; // 清除旧的滤镜
            
            // 根据选项添加 CSS 滤镜
            if (futureChoice.includes('age gracefully')) {
                draggableImage.classList.add('filter-age');
            } else if (futureChoice.includes('marked by')) {
                draggableImage.classList.add('filter-scar');
            } else if (futureChoice.includes('lasered off')) {
                draggableImage.style.opacity = 0; // 淡出
            }
            
            filterButtonsContainer.style.display = 'none'; // 隐藏按钮
            finishBtn.classList.remove('hidden'); // 显示“完成”按钮
        }
    });
    
    // (步骤 3) 关闭摄像头的功能
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(function(track) { track.stop(); });
            webcamStream = null;
        }
    }
    
    // (步骤 3 结束) 当用户点击 "[ Finish Consultation ]"
    finishBtn.addEventListener('click', function() {
        stopWebcam(); // 关闭摄像头
        showSummary(); // (进入步骤 4) 显示总结页面
    });

    // ===============================================
    // ==== 5. 步骤 4: 总结页面的逻辑 ====
    // ===============================================

    // (步骤 4) 显示总结页面
    function showSummary() {
        showPage(summaryPage); // 切换到总结页面
        summaryAnswersContainer.innerHTML = ''; // 清空旧内容
        
        // 使用一个 for 循环来显示所有的问题和答案
        for (var i = 0; i < questionLabels.length; i++) {
            var label = questionLabels[i];
            var answer = userAnswers[i];
            
            // 如果用户没回答，就显示 '...'
            if (!answer) {
                answer = '...';
            }

            // 创建一个新的 div 元素来放问答
            var item = document.createElement('div');
            item.className = 'summary-item';
            
            // 用字符串拼接创建 HTML
            item.innerHTML = '<p class="summary-q">Q: ' + label + '</p>' +
                             '<p class="summary-a">' + answer + '</p>';
            
            // 把这个 div 添加到容器里
            summaryAnswersContainer.appendChild(item);
        }

        // (步骤 4) 显示“未来”选择
        if (futureChoice) {
            summaryFutureChoice.textContent = futureChoice;
        } else {
            summaryFutureChoice.textContent = 'No choice made';
        }
    }
    
    // (步骤 4) 打印按钮
    printBtn.addEventListener('click', function() {
        window.print(); // 调用浏览器的打印功能
    });
    
}); // --- DOMContentLoaded 结束 ---
// Wait for the DOM to be fully loaded before running the script.
document.addEventListener('DOMContentLoaded', function() {
    // Page containers
    var welcomePage = document.getElementById('welcome-page');
    var consultationPage = document.getElementById('consultation-page');
    var arPage = document.getElementById('ar-page');
    var summaryPage = document.getElementById('summary-page');
    // Consultation (Step 1-2) elements
    var fileInput = document.getElementById('file-upload');
    var tattooPreviewImage = document.getElementById('tattoo-preview-image');
    var questionText = document.getElementById('question-text');
    var answerInput = document.getElementById('answer-input');
    var progressBar = document.getElementById('progress-bar');
    var nextBtn = document.getElementById('next-btn');
    // AR (Step 3) elements
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
    // Summary (Step 4) elements
    var summaryImage = document.getElementById('summary-image');
    var summaryAnswersContainer = document.getElementById('summary-answers-container');
    var summaryFutureChoice = document.getElementById('summary-future-choice');
    var printBtn = document.getElementById('print-btn');
    // 1. State and Data
    // All consultation questions
    var questions = [
        "This design is cool. What's the story behind it? Or just, what made you land on this?", 
        "Did something specific happen that made you decide 'now is the time' to get it?", 
        "Got a spot in mind?... Okay, with that placement, are you hoping it's seen all the time, or is it more just for you?", 
        "Are you hoping this piece will... I don't know, remind you of something down the line? Or give you a bit of strength?", 
        "Last one, and it's a bit of a deep cut: Have you thought about 20 years from now... what will you feel when you look at this tattoo?"
    ];
    // Labels for the summary page (must match questions array)
    var questionLabels = [
        "Design Story & Motivation", 
        "The Timing", 
        "Placement & Visibility", 
        "Expectation & Purpose", 
        "Thoughts on the Future"
    ];
    // State tracking variables
    var currentQuestionIndex = 0;
    var userAnswers = []; // Array to store all user answers
    var futureChoice = "";
    var uploadedImageURL = '';
    var webcamStream = null; // To store the webcam stream object (for stopping it later)

    // 2. Helper Functions (Page Navigation)
    // Helper function to show a specific page and hide all others
    function showPage(pageToShow) {
        // Hide all pages
        welcomePage.classList.add('hidden');
        consultationPage.classList.add('hidden');
        arPage.classList.add('hidden');
        summaryPage.classList.add('hidden');
        // Show the target page
        pageToShow.classList.remove('hidden');
    }
    // 3. Step 1 & 2: Welcome & Consultation Logic
    // Step 1: Listen for file upload
    fileInput.addEventListener('change', function(e) {
        // Check if a file was selected
        if (e.target.files[0]) {
            var reader = new FileReader(); // Create a file reader
            // After the file is read
            reader.onload = function(e) {
                uploadedImageURL = e.target.result; // Store the image data URL
                // Populate all image elements with the uploaded pic
                tattooPreviewImage.src = uploadedImageURL;
                draggableImage.src = uploadedImageURL;
                summaryImage.src = uploadedImageURL;
                // Move to Step 2: Start consultation
                startConsultation();
            };
            // Read the file as a Data URL
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    // Step 2: Start the consultation flow
    function startConsultation() {
        showPage(consultationPage); // Show the consultation page
        currentQuestionIndex = 0; // Reset question index
        userAnswers = []; // Clear previous answers
        displayCurrentQuestion(); // Show the first question
        updateImageClarity(); // Set initial image blur
    }
    // Display the current question
    function displayCurrentQuestion() {
        questionText.style.opacity = 0; // Fade out old question text
        // Wait for fade-out, then fade in new question
        setTimeout(function() {
            // Update question text
            questionText.innerHTML = '<strong>[ Question ' + (currentQuestionIndex + 1) + '/' + questions.length + ' ]</strong><br>' + questions[currentQuestionIndex];
            questionText.style.opacity = 1;
        }, 500);
        // Disable 'Next' button until user types
        nextBtn.disabled = true; 
    }
    // Update image blur/opacity and progress bar based on progress
    function updateImageClarity() {
        var progress = currentQuestionIndex / questions.length; // Calculate progress (0.0 to 1.0)
        var blurValue = (1 - progress) * 25; // More progress = less blur
        var opacityValue = 0.2 + (progress * 0.8); // More progress = higher opacity (from 0.2 to 1.0) 
        tattooPreviewImage.style.filter = 'blur(' + blurValue + 'px) opacity(' + opacityValue + ')';
        progressBar.style.width = (progress * 100) + '%';
    }
    // Enable 'Next' button only if there is text in the input
    answerInput.addEventListener('input', function() {
        // .trim() removes whitespace
        if (answerInput.value.trim() === '') {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    });
    // Handle 'Next' button click
    nextBtn.addEventListener('click', function() {
        userAnswers.push(answerInput.value); // Save the answer
        answerInput.value = ''; // Clear input field
        currentQuestionIndex++; // Move to the next question
        // Check if there are more questions
        if (currentQuestionIndex < questions.length) {
            // If yes, display next question and update progress
            displayCurrentQuestion();
            updateImageClarity();
        } else {
            // If no (all questions answered)
            progressBar.style.width = '100%';
            tattooPreviewImage.style.filter = 'blur(0px) opacity(1)'; // Set progress to 100% and image to full clarity
            questionText.style.opacity = 0;
            
            // Show transition message
            setTimeout(function() {
                questionText.innerHTML = "<strong>Okay, it really sounds like you've thought this through. That's awesome.</strong><br><br>Before we book the appointment, let's do one last thing—let's see how it actually looks on you.";
                questionText.style.opacity = 1;
            }, 500); 
            // Hide input and progress bar
            answerInput.style.display = 'none';
            progressBar.parentElement.style.display = 'none';
            // Change button to 'Start AR' and update its click handler
            nextBtn.textContent = '[ Start AR Try-On ]';
            nextBtn.disabled = false;
            nextBtn.onclick = startARSimulation; // New click handler to start AR
        }
    });
    // 4. Step 3: AR Try-On Logic
    // Start the AR simulation
    function startARSimulation() {
        showPage(arPage); // Show the AR page
        // Stop any existing webcam stream first
        if (webcamStream) {
            webcamStream.getTracks().forEach(function(track) { track.stop(); });
            webcamStream = null;
        }
        // Request access to the user's webcam
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(function(stream) {
                // Success: Got the stream
                webcamStream = stream; // Save the stream so we can stop it later
                webcamFeed.srcObject = stream;
                // Show AR controls and initial instructions
                arControls.classList.remove('hidden');
                initialReflectionContent.classList.remove('hidden'); 
                futureReflectionContent.classList.add('hidden'); // Hide future reflection part
                finishBtn.classList.add('hidden'); // Hide final finish button
            })
            .catch(function(err) {
                // Error: Failed to get stream
                console.error("Error accessing webcam: ", err); 
                alert("Could not access your webcam. Please check your browser permissions and refresh the page."); 
            });
    }
    // AR Drag, Scale, Rotate
    // Variables for drag/pan state
    var isDragging = false, currentX = 0, currentY = 0, initialX = 0, initialY = 0, currentScale = 1, currentRotation = 0;
    // Drag start (mousedown or touchstart)
    function dragStart(e) {
        // Handle both touch and mouse events
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - currentX;
            initialY = e.touches[0].clientY - currentY;
        } else {
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        }
        // Only start dragging if the target is the image itself
        if (e.target === draggableImage) {
            isDragging = true;
        }
    }
    // Drag end (mouseup or touchend)
    function dragEnd() {
        isDragging = false;
    }
    // Dragging (mousemove or touchmove)
    function drag(e) {
        if (isDragging) {
            e.preventDefault(); // Prevent page scrolling
            // Handle both touch and mouse
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            updateTattooTransform(); // Apply the new transform
        }
    }
    // Helper function to apply all transforms at once
    function updateTattooTransform() {
        draggableImage.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0) scale(' + currentScale + ') rotate(' + currentRotation + 'deg)';
    }

    // Bind AR Event Listeners
    // Mouse drag events
    draggableImage.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    // Touch drag events
    draggableImage.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    // Scale slider
    scaleSlider.addEventListener('input', function(e) {
        currentScale = parseFloat(e.target.value) / 150; // Convert slider value (20-400 range) to a scale factor
        updateTattooTransform();
    });
    // Rotate slider
    rotateSlider.addEventListener('input', function(e) {
        currentRotation = parseInt(e.target.value);
        updateTattooTransform();
    });
    // User clicks '[ I've got the spot ]'
    tryonDoneBtn.addEventListener('click', function() {
        arControls.classList.add('hidden'); // Hide transform controls
        initialReflectionContent.classList.add('hidden'); // Hide initial instructions
        futureReflectionContent.classList.remove('hidden'); // Show the 'future' reflection questions
    });
    // User clicks a 'future' scenario button
    filterButtonsContainer.addEventListener('click', function(e) {
        // Use event delegation, check if a BUTTON was clicked
        if (e.target.tagName === 'BUTTON') {
            futureChoice = e.target.dataset.choice; // Get the choice from the data-attribute
            draggableImage.className = ""; // Clear any existing filters
            // Apply the corresponding CSS filter class
            if (futureChoice.includes('age gracefully')) {
                draggableImage.classList.add('filter-age');
            } else if (futureChoice.includes('marked by')) {
                draggableImage.classList.add('filter-scar');
            } else if (futureChoice.includes('lasered off')) {
                draggableImage.style.opacity = 0; // Fade out for 'laser'
            }
            filterButtonsContainer.style.display = 'none'; // Hide the choice buttons
            finishBtn.classList.remove('hidden'); // Show the final 'Finish' button
        }
    });
    // Helper function to stop the webcam stream
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(function(track) { track.stop(); });
            webcamStream = null;
        }
    }
    // User clicks '[ Finish Consultation ]'
    finishBtn.addEventListener('click', function() {
        stopWebcam(); // Stop the webcam
        showSummary(); // Go to Step 4: Summary
    });
    // 5. Step 4: Summary Page Logic
    // Build and display the summary page
    function showSummary() {
        showPage(summaryPage); // Show the summary page
        summaryAnswersContainer.innerHTML = ''; // Clear any previous summary content
        // Loop through all questions and answers to build the summary
        for (var i = 0; i < questionLabels.length; i++) {
            var label = questionLabels[i];
            var answer = userAnswers[i];
            // Add a placeholder if an answer is missing
            if (!answer) {
                answer = '...';
            }
            // Create a new div for this Q&A pair
            var item = document.createElement('div');
            item.className = 'summary-item';
            // Build the HTML for the Q&A item
            item.innerHTML = '<p class="summary-q">Q: ' + label + '</p>' +
                             '<p class="summary-a">' + answer + '</p>';
            // Add the new item to the container
            summaryAnswersContainer.appendChild(item);
        }
        // Display the 'future' reflection choice
        if (futureChoice) {
            summaryFutureChoice.textContent = futureChoice;
        } else {
            summaryFutureChoice.textContent = 'No choice made';
        }
    }
    // Print button handler
    printBtn.addEventListener('click', function() {
        window.print(); // Use the browser's print dialog
    });
}); // End of DOMContentLoaded
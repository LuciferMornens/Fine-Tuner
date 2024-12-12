const form = document.querySelector('form');
const responseDiv = document.getElementById('response');
const addPromptButton = document.getElementById('add-prompt');
const promptsContainer = document.getElementById('prompts-container');
const themeToggle = document.getElementById('theme-toggle');
const submitButton = document.getElementById('submit-btn');
const multiPromptModeCheckbox = document.getElementById('multi_prompt_mode');

function createPromptSet() {
    const promptSet = document.createElement('div');
    promptSet.className = 'prompt-set';
    promptSet.innerHTML = `
        <div class="form-group">
            <label for="user_input">User Input:</label>
            <textarea class="user-input" name="user_input[]" rows="4"></textarea>
        </div>

        <div class="form-group">
            <label for="assistant_input">Assistant Input:</label>
            <textarea class="assistant-input" name="assistant_input[]" rows="4"></textarea>
        </div>

        <div class="form-group weight-container" style="display: none;">
            <label for="weight">Weight:</label>
            <select class="weight" name="weight[]">
                <option value="1">1</option>
                <option value="0">0</option>
            </select>
        </div>

        <button type="button" class="button remove-prompt">
            <i class="fas fa-trash"></i> Remove Prompt
        </button>
    `;
    return promptSet;
}

addPromptButton.addEventListener('click', () => {
    const newPromptSet = createPromptSet();
    promptsContainer.appendChild(newPromptSet);
    
    // Add animation
    newPromptSet.style.opacity = '0';
    newPromptSet.style.transform = 'translateY(20px)';
    setTimeout(() => {
        newPromptSet.style.transition = 'all 0.3s ease';
        newPromptSet.style.opacity = '1';
        newPromptSet.style.transform = 'translateY(0)';
    }, 10);
});

promptsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.remove-prompt')) {
        const promptSet = event.target.closest('.prompt-set');
        promptSet.style.transition = 'all 0.3s ease';
        promptSet.style.opacity = '0';
        promptSet.style.transform = 'translateY(20px)';
        setTimeout(() => promptSet.remove(), 300);
    }
});

multiPromptModeCheckbox.addEventListener('change', () => {
    addPromptButton.style.display = multiPromptModeCheckbox.checked ? 'inline-flex' : 'none';
    const promptSets = promptsContainer.querySelectorAll('.prompt-set');
    promptSets.forEach((set, index) => {
        if (index === 0) return;
        if (multiPromptModeCheckbox.checked) {
            set.style.display = 'block';
            set.style.opacity = '0';
            set.style.transform = 'translateY(20px)';
            setTimeout(() => {
                set.style.transition = 'all 0.3s ease';
                set.style.opacity = '1';
                set.style.transform = 'translateY(0)';
            }, index * 100);
        } else {
            set.style.transition = 'all 0.3s ease';
            set.style.opacity = '0';
            set.style.transform = 'translateY(20px)';
            setTimeout(() => {
                set.style.display = 'none';
            }, 300);
        }
    });
    document.querySelectorAll('.weight-container').forEach(container => {
        container.style.display = multiPromptModeCheckbox.checked ? 'flex' : 'none';
    });
});

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Initialize theme from localStorage or system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition');
    
    // Set new theme
    setTheme(newTheme);
    
    // Remove transition class after animation
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Disable form and show loading state
    submitButton.disabled = true;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        const formData = new FormData(form);
        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        
        // Show success response with animation
        responseDiv.innerHTML = `
            <div class="response-content success">
                <div class="response-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="response-message">
                    <p class="response-text">${text}</p>
                    <p class="response-subtext">Your fine-tuning data has been saved successfully.</p>
                </div>
            </div>
        `;
        
        // Clear inputs with animation
        const inputs = form.querySelectorAll('.user-input, .assistant-input');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.style.transition = 'all 0.3s ease';
                input.style.opacity = '0';
                input.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    input.value = '';
                    input.style.opacity = '1';
                    input.style.transform = 'translateY(0)';
                }, 300);
            }, index * 100); // Stagger the animations
        });

        // Reset form state
        if (multiPromptModeCheckbox.checked) {
            const promptSets = document.querySelectorAll('.prompt-set:not(:first-child)');
            promptSets.forEach((set, index) => {
                setTimeout(() => {
                    set.style.transition = 'all 0.3s ease';
                    set.style.opacity = '0';
                    set.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => set.remove(), 300);
                }, index * 100);
            });
            multiPromptModeCheckbox.checked = false;
            addPromptButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        responseDiv.innerHTML = `
            <div class="response-content error">
                <div class="response-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="response-message">
                    <p class="response-text">An error occurred</p>
                    <p class="response-subtext">Please try again. If the problem persists, contact support.</p>
                </div>
            </div>
        `;
    } finally {
        // Restore submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

// Initialize the form
multiPromptModeCheckbox.checked = false;
addPromptButton.style.display = 'none';

// Keyboard navigation detection
function handleFirstTab(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
        document.body.classList.remove('using-mouse');
        window.removeEventListener('keydown', handleFirstTab);
        window.addEventListener('mousedown', handleMouseDownOnce);
    }
}

function handleMouseDownOnce() {
    document.body.classList.add('using-mouse');
    document.body.classList.remove('using-keyboard');
    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
}

window.addEventListener('keydown', handleFirstTab);

// Prevent focus on click for buttons while maintaining keyboard accessibility
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousedown', e => {
        if (document.body.classList.contains('using-mouse')) {
            e.preventDefault();
        }
    });
});

// Set initial theme
document.documentElement.setAttribute('data-theme', 'light');

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add hover effects for form elements
const formElements = document.querySelectorAll('textarea, select, button');
formElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transition = 'all 0.2s ease';
        if (element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            element.style.boxShadow = '0 4px 8px var(--shadow-color)';
        }
    });
    
    element.addEventListener('mouseleave', () => {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            element.style.boxShadow = '0 2px 4px var(--shadow-color)';
        }
    });
});

// Smooth scroll to response
responseDiv.addEventListener('DOMNodeInserted', () => {
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Add ripple effect to buttons
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => ripple.remove(), 600);
    });
});
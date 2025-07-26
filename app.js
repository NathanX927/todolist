document.addEventListener('DOMContentLoaded', () => {
    // ======== 全局：视图切换 ========
    const navDaily = document.getElementById('nav-daily');
    const navFitness = document.getElementById('nav-fitness');
    const dailyView = document.getElementById('daily-view');
    const fitnessView = document.getElementById('fitness-view');

    function switchView(viewToShow) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (viewToShow === 'daily') {
            dailyView.classList.add('active-view');
            navDaily.classList.add('active');
        } else if (viewToShow === 'fitness') {
            fitnessView.classList.add('active-view');
            navFitness.classList.add('active');
        }
    }
    navDaily.addEventListener('click', () => switchView('daily'));
    navFitness.addEventListener('click', () => switchView('fitness'));

    // ======== 全局：自定义弹窗逻辑 ========
    const customAlertModal = document.getElementById('custom-alert-modal');
    if (customAlertModal) {
        const alertCloseBtn = document.getElementById('alert-close-btn');
        function showCustomAlert(title, message) {
            document.getElementById('alert-title').textContent = title;
            document.getElementById('alert-message').textContent = message;
            customAlertModal.style.display = 'block';
        }
        function hideCustomAlert() {
            customAlertModal.style.display = 'none';
        }
        alertCloseBtn.addEventListener('click', hideCustomAlert);
    }
    
    // ======== 模块一：日常待办 (完整功能) ========
    (function DailyTodoModule() {
        const taskInput = document.getElementById('task-input');
        const addTaskBtn = document.getElementById('add-task-btn');
        const taskList = document.getElementById('task-list');
        const daySelector = document.getElementById('day-selector');
        const loadPresetBtn = document.getElementById('load-preset-btn');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const managePresetBtn = document.getElementById('manage-preset-btn');
        const presetModal = document.getElementById('preset-modal');
        const closeModalBtn = document.getElementById('close-preset-modal');
        const modalDaySelector = document.getElementById('modal-day-selector');
        const presetTasksInput = document.getElementById('preset-tasks-input');
        const savePresetBtn = document.getElementById('save-preset-btn');
        
        const defaultPresetTasks = {
            Monday: ["完成周报", "整理代码"], Tuesday: ["项目会议"], Wednesday: ["学习新技术"],
            Thursday: ["UI设计"], Friday: ["项目部署"], Saturday: ["打扫卫生"], Sunday: ["阅读"]
        };
        let userPresetTasks = JSON.parse(localStorage.getItem('userPresetTasks')) || defaultPresetTasks;

        function updateProgress() {
            const totalTasks = taskList.children.length;
            if (totalTasks === 0) {
                progressBar.style.width = '0%';
                progressText.textContent = '无任务';
                return;
            }
            const completedTasks = taskList.querySelectorAll('li.completed').length;
            const percentage = Math.round((completedTasks / totalTasks) * 100);
            progressBar.style.width = percentage + '%';
            progressText.textContent = percentage + '%';
        }

        function createTaskElement(taskText, isCompleted = false) {
            const li = document.createElement('li');
            if (isCompleted) li.classList.add('completed');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', () => {
                li.classList.toggle('completed');
                updateProgress();
            });
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = taskText;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => {
                taskList.removeChild(li);
                updateProgress();
            };
            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            return li;
        }

        function addTask() {
            const taskText = taskInput.value.trim();
            if (taskText === '') return;
            taskList.appendChild(createTaskElement(taskText));
            taskInput.value = '';
            taskInput.focus();
            updateProgress();
        }

        function loadPresetTasks(day) {
            taskList.innerHTML = '';
            const tasks = userPresetTasks[day] || [];
            tasks.forEach(taskText => taskList.appendChild(createTaskElement(taskText)));
            updateProgress();
        }

        function openPresetModal() {
            modalDaySelector.value = daySelector.value;
            displayTasksInTextarea(daySelector.value);
            presetModal.style.display = 'block';
        }

        function closePresetModal() {
            presetModal.style.display = 'none';
        }

        function displayTasksInTextarea(day) {
            presetTasksInput.value = (userPresetTasks[day] || []).join('\n');
        }

        function savePreset() {
            const day = modalDaySelector.value;
            const tasks = presetTasksInput.value.split('\n').map(t => t.trim()).filter(t => t);
            userPresetTasks[day] = tasks;
            localStorage.setItem('userPresetTasks', JSON.stringify(userPresetTasks));
            alert(`“${day}”的预设已保存！`);
            closePresetModal();
        }

        function initialize() {
            const today = new Date().toLocaleString('en-US', { weekday: 'long' });
            daySelector.value = today;
            loadPresetTasks(today);
        }

        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
        loadPresetBtn.addEventListener('click', () => loadPresetTasks(daySelector.value));
        managePresetBtn.addEventListener('click', openPresetModal);
        closeModalBtn.addEventListener('click', closePresetModal);
        savePresetBtn.addEventListener('click', savePreset);
        modalDaySelector.addEventListener('change', (e) => displayTasksInTextarea(e.target.value));
        initialize();
    })();

    // ======== 模块二：健身训练 (完整功能 + 加固) ========
    (function FitnessModule() {
        const templateSelector = document.getElementById('fitness-template-selector');
        const loadTemplateBtn = document.getElementById('load-fitness-template-btn');
        const manageTemplatesBtn = document.getElementById('manage-fitness-templates-btn');
        const workoutSession = document.getElementById('workout-session');
        const modal = document.getElementById('fitness-modal');
        const closeModalBtn = document.getElementById('close-fitness-modal');
        const templateListSelector = document.getElementById('template-list-selector');
        const editTemplateBtn = document.getElementById('edit-template-btn');
        const deleteTemplateBtn = document.getElementById('delete-template-btn');
        const templateNameInput = document.getElementById('template-name-input');
        const templateExercisesInput = document.getElementById('template-exercises-input');
        const saveTemplateBtn = document.getElementById('save-template-btn');
        
        const defaultFitnessTemplates = {
            "推力日 (Push)": ["平板杠铃卧推 4x10 90", "上斜哑铃卧推 3x12 75", "坐姿哑铃推举 4x10 90", "哑铃侧平举 4x15", "绳索下压 3x15 60"],
            "拉力日 (Pull)": ["高位下拉 4x12 75", "坐姿划船 4x12 75", "直臂下压 3x15", "哑铃弯举 4x12 60", "腹部训练 5x20 45"]
        };
        let fitnessTemplates = JSON.parse(localStorage.getItem('fitnessTemplates')) || defaultFitnessTemplates;

        function populateTemplateSelectors() {
            templateSelector.innerHTML = '';
            templateListSelector.innerHTML = '';
            Object.keys(fitnessTemplates).forEach(name => {
                templateSelector.add(new Option(name, name));
                templateListSelector.add(new Option(name, name));
            });
        }

        function saveTemplates() {
            localStorage.setItem('fitnessTemplates', JSON.stringify(fitnessTemplates));
            populateTemplateSelectors();
        }

        function loadWorkout(templateName) {
            workoutSession.innerHTML = '';
            const exercises = fitnessTemplates[templateName] || [];
            exercises.forEach(str => workoutSession.appendChild(createExerciseCard(str)));
        }
        
        function createExerciseCard(exerciseString) {
            const parts = exerciseString.match(/(.+) (\d+)x(\d+)(?: (\d+))?/);
            if (!parts) return document.createDocumentFragment();
            const [, name, sets, reps, restTime] = parts;
            const restDuration = restTime || 60;
            const card = document.createElement('div');
            card.className = 'exercise-card';
            const header = document.createElement('div');
            header.className = 'exercise-header';
            header.textContent = `${name} (目标: ${sets}组 x ${reps}次)`;
            card.appendChild(header);
            const setsContainer = document.createElement('div');
            setsContainer.className = 'sets-container';
            for (let i = 1; i <= sets; i++) {
                const setRow = document.createElement('div');
                setRow.className = 'set-row';
                // [核心加固] 为输入框添加了class
                setRow.innerHTML = `<label>第${i}组</label><input type="number" class="input-weight" placeholder="重量"><input type="number" class="input-reps" placeholder="次数"><button class="timer-btn" data-rest="${restDuration}">休息${restDuration}s</button>`;
                setsContainer.appendChild(setRow);
            }
            card.appendChild(setsContainer);
            return card;
        }

        manageTemplatesBtn.addEventListener('click', () => { modal.style.display = 'block'; templateNameInput.value = ''; templateExercisesInput.value = ''; });
        closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
        
        editTemplateBtn.addEventListener('click', () => {
            const name = templateListSelector.value;
            if (!name) return;
            templateNameInput.value = name;
            templateExercisesInput.value = fitnessTemplates[name].join('\n');
        });

        deleteTemplateBtn.addEventListener('click', () => {
            const name = templateListSelector.value;
            if (name && confirm(`确定要删除模板 “${name}” 吗？`)) {
                delete fitnessTemplates[name];
                saveTemplates();
                templateNameInput.value = '';
                templateExercisesInput.value = '';
            }
        });

        saveTemplateBtn.addEventListener('click', () => {
            const name = templateNameInput.value.trim();
            const exercises = templateExercisesInput.value.split('\n').filter(e => e.trim());
            if (!name || exercises.length === 0) {
                alert('模板名称和动作列表不能为空！');
                return;
            }
            fitnessTemplates[name] = exercises;
            saveTemplates();
            alert('模板已保存！');
        });

        loadTemplateBtn.addEventListener('click', () => {
            if (templateSelector.value) loadWorkout(templateSelector.value);
        });
        
        workoutSession.addEventListener('click', function(e) {
            if (e.target.classList.contains('timer-btn') && !e.target.disabled) {
                const btn = e.target;
                const restTime = btn.dataset.rest;
                let seconds = parseInt(restTime, 10);
                btn.disabled = true;
                const interval = setInterval(() => {
                    btn.textContent = `... ${seconds}s`;
                    seconds--;
                    if (seconds < 0) {
                        clearInterval(interval);
                        if (typeof showCustomAlert === 'function') {
                            showCustomAlert('能量补充完毕!', '准备好进行下一组训练！');
                        } else {
                            alert('休息结束，开始下一组！');
                        }
                        btn.textContent = `休息${restTime}s`;
                        btn.disabled = false;
                    }
                }, 1000);
            }
        });
        
        populateTemplateSelectors();
    })();

    // 初始化默认视图
    switchView('daily');
});

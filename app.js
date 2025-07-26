const CURRENT_VERSION = '1.0.6';  // 版本号，发布时手动更新
const UPDATE_MESSAGE = `
  版本 1.0.6 更新内容：
  - 新增页面更新弹窗提示
  - 修复部分已知问题
  - 优化功能体验
`;

// 版本提示弹窗函数
function showUpdateModal(message) {
    document.getElementById('icon-info').style.display = 'block';
    document.getElementById('icon-energy').style.display = 'none';

    const modal = document.getElementById('custom-alert-modal');
    document.getElementById('alert-title').textContent = '应用更新提示';
    document.getElementById('alert-message').textContent = message;
    const closeBtn = document.getElementById('alert-close-btn');
    closeBtn.textContent = '明白收到'; // ***设为“明白收到”***
    modal.style.display = 'block';

    function closeHandler() {
        modal.style.display = 'none';
        closeBtn.removeEventListener('click', closeHandler);
    }
    closeBtn.addEventListener('click', closeHandler);
}


// 版本检查函数
function checkAndShowUpdate() {
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion !== CURRENT_VERSION) {
        showUpdateModal(UPDATE_MESSAGE.trim());
        localStorage.setItem('app_version', CURRENT_VERSION);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAndShowUpdate();
    // ======== 全局：视图切换 ========
    const navDaily = document.getElementById('nav-daily');
    const navFitness = document.getElementById('nav-fitness');
    const navAnalysis = document.getElementById('nav-analysis');
    const views = {
        daily: document.getElementById('daily-view'),
        fitness: document.getElementById('fitness-view'),
        analysis: document.getElementById('analysis-view')
    };
    const navButtons = {
        daily: navDaily,
        fitness: navFitness,
        analysis: navAnalysis
    };

    function switchView(viewToShow) {
        Object.values(views).forEach(v => v.classList.remove('active-view'));
        Object.values(navButtons).forEach(b => b.classList.remove('active'));
        views[viewToShow].classList.add('active-view');
        navButtons[viewToShow].classList.add('active');
        if (viewToShow === 'analysis') {
            AnalysisModule.init();
        }
    }
    navDaily.addEventListener('click', () => switchView('daily'));
    navFitness.addEventListener('click', () => switchView('fitness'));
    navAnalysis.addEventListener('click', () => switchView('analysis'));

    // ======== 全局：自定义弹窗逻辑 ========
    function showEnergyModal(title, message) {
        document.getElementById('icon-info').style.display = 'none';
        document.getElementById('icon-energy').style.display = 'block';

        const modal = document.getElementById('custom-alert-modal');
        document.getElementById('alert-title').textContent = title;
        document.getElementById('alert-message').textContent = message;
        modal.style.display = 'block';
        const closeBtn = document.getElementById('alert-close-btn');
        function closeHandler() {
            modal.style.display = 'none';
            closeBtn.removeEventListener('click', closeHandler);
        }
        closeBtn.addEventListener('click', closeHandler);
    }


    // ======== 模块一：日常待办 ========
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

        let userPresetTasks = JSON.parse(localStorage.getItem('userPresetTasks')) || {
            Monday: ["完成周报"],
            Tuesday: ["项目会议"],
            Wednesday: ["学习新技术"],
            Thursday: ["UI设计"],
            Friday: ["项目部署"],
            Saturday: ["打扫卫生"],
            Sunday: ["阅读"]
        };

        function saveCurrentTasks() {
            const tasks = [];
            taskList.querySelectorAll('li').forEach(li => {
                tasks.push({
                    text: li.querySelector('.task-text').textContent,
                    completed: li.classList.contains('completed')
                });
            });
            localStorage.setItem('currentDailyTasks', JSON.stringify(tasks));
        }

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
                saveCurrentTasks();
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
                saveCurrentTasks();
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
            saveCurrentTasks();
        }

        function loadPresetTasks(day) {
            if (taskList.children.length > 0 && !confirm('加载预设会覆盖当前任务，确定吗?')) {
                return;
            }
            taskList.innerHTML = '';
            const tasks = userPresetTasks[day] || [];
            tasks.forEach(taskText => taskList.appendChild(createTaskElement(taskText)));
            updateProgress();
            saveCurrentTasks();
        }

        function initialize() {
            const savedTasks = JSON.parse(localStorage.getItem('currentDailyTasks'));
            if (savedTasks && savedTasks.length > 0) {
                taskList.innerHTML = '';
                savedTasks.forEach(task => taskList.appendChild(createTaskElement(task.text, task.completed)));
                updateProgress();
            } else {
                const today = new Date().toLocaleString('en-US', { weekday: 'long' });
                daySelector.value = today;
                loadPresetTasks(today);
            }
        }

        function openPresetModal() {
            modalDaySelector.value = daySelector.value;
            displayTasksInTextarea(daySelector.value);
            presetModal.style.display = 'block';
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
            presetModal.style.display = 'none';
        }

        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
        loadPresetBtn.addEventListener('click', () => loadPresetTasks(daySelector.value));
        managePresetBtn.addEventListener('click', openPresetModal);
        closeModalBtn.addEventListener('click', () => presetModal.style.display = 'none');
        savePresetBtn.addEventListener('click', savePreset);
        modalDaySelector.addEventListener('change', (e) => displayTasksInTextarea(e.target.value));
        initialize();
    })();

    // ======== 模块二：健身训练 ========
    (function FitnessModule() {
        const templateSelector = document.getElementById('fitness-template-selector');
        const loadTemplateBtn = document.getElementById('load-fitness-template-btn');
        const manageTemplatesBtn = document.getElementById('manage-fitness-templates-btn');
        const workoutSession = document.getElementById('workout-session');
        const finishWorkoutBtn = document.getElementById('finish-workout-btn');
        const modal = document.getElementById('fitness-modal');
        const closeModalBtn = document.getElementById('close-fitness-modal');
        const templateListSelector = document.getElementById('template-list-selector');
        const newTemplateBtn = document.getElementById('new-template-btn');
        const editTemplateBtn = document.getElementById('edit-template-btn');
        const deleteTemplateBtn = document.getElementById('delete-template-btn');
        const templateNameInput = document.getElementById('template-name-input');
        const templateExercisesInput = document.getElementById('template-exercises-input');
        const saveTemplateBtn = document.getElementById('save-template-btn');

        let fitnessTemplates = JSON.parse(localStorage.getItem('fitnessTemplates')) || {
            "推力日 (Push)": ["平板杠铃卧推 4x10 90", "上斜哑铃卧推 3x12 75"],
            "拉力日 (Pull)": ["高位下拉 4x12 75", "坐姿划船 4x12 75"]
        };

        function checkShowFinishButton() {
            finishWorkoutBtn.style.display = workoutSession.children.length > 0 ? 'block' : 'none';
        }

        function archiveWorkout() {
            const currentWorkoutData = JSON.parse(localStorage.getItem('currentWorkoutSession'));
            if (!currentWorkoutData || currentWorkoutData.length === 0) {
                alert("没有可保存的训练。");
                return;
            }
            let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            const today = new Date().toISOString().split('T')[0];
            history.push({ date: today, workout: currentWorkoutData });
            localStorage.setItem('workoutHistory', JSON.stringify(history));
            localStorage.removeItem('currentWorkoutSession');
            workoutSession.innerHTML = '';
            checkShowFinishButton();
            alert('训练已成功保存到历史记录！');
        }

        function saveCurrentWorkout() {
            const workoutData = [];
            workoutSession.querySelectorAll('.exercise-card').forEach(card => {
                const exercise = { header: card.querySelector('.exercise-header').textContent, sets: [] };
                card.querySelectorAll('.set-row').forEach(row => {
                    exercise.sets.push({
                        weight: row.querySelector('.input-weight').value,
                        reps: row.querySelector('.input-reps').value,
                        rest: row.querySelector('.timer-btn').dataset.rest
                    });
                });
                workoutData.push(exercise);
            });
            if (workoutData.length > 0) {
                localStorage.setItem('currentWorkoutSession', JSON.stringify(workoutData));
            } else {
                localStorage.removeItem('currentWorkoutSession');
            }
        }

        function loadSavedWorkout(savedData) {
            workoutSession.innerHTML = '';
            savedData.forEach(exerciseData => {
                const card = document.createElement('div');
                card.className = 'exercise-card';
                const header = document.createElement('div');
                header.className = 'exercise-header';
                header.textContent = exerciseData.header;
                card.appendChild(header);
                const setsContainer = document.createElement('div');
                setsContainer.className = 'sets-container';
                exerciseData.sets.forEach((setData, index) => {
                    const setRow = document.createElement('div');
                    setRow.className = 'set-row';
                    setRow.innerHTML = `<label>第${index + 1}组</label>
                                       <input type="number" class="input-weight" placeholder="重量" value="${setData.weight || ''}">
                                       <input type="number" class="input-reps" placeholder="次数" value="${setData.reps || ''}">
                                       <button class="timer-btn" data-rest="${setData.rest}">休息${setData.rest}s</button>`;
                    setsContainer.appendChild(setRow);
                });
                card.appendChild(setsContainer);
                workoutSession.appendChild(card);
            });
        }

        function loadWorkout(templateName) {
            if (workoutSession.children.length > 0 && !confirm("加载新模板会覆盖当前训练进度，确定吗?")) return;
            workoutSession.innerHTML = '';
            const exercises = fitnessTemplates[templateName] || [];
            exercises.forEach(str => workoutSession.appendChild(createExerciseCard(str)));
            saveCurrentWorkout();
            checkShowFinishButton();
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
                setRow.innerHTML = `<label>第${i}组</label>
                                    <input type="number" class="input-weight" placeholder="重量">
                                    <input type="number" class="input-reps" placeholder="次数">
                                    <button class="timer-btn" data-rest="${restDuration}">休息${restDuration}s</button>`;
                setsContainer.appendChild(setRow);
            }
            card.appendChild(setsContainer);
            return card;
        }

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

        manageTemplatesBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        newTemplateBtn.addEventListener('click', () => {
            templateListSelector.selectedIndex = -1;
            templateNameInput.value = '';
            templateExercisesInput.value = '';
            templateNameInput.focus();
        });

        editTemplateBtn.addEventListener('click', () => {
            const name = templateListSelector.value;
            if (!name) {
                alert("请先从列表中选择一个模板进行编辑。");
                return;
            }
            templateNameInput.value = name;
            templateExercisesInput.value = fitnessTemplates[name].join('\n');
        });

        deleteTemplateBtn.addEventListener('click', () => {
            const name = templateListSelector.value;
            if (!name) {
                alert("请先从列表中选择一个要删除的模板。");
                return;
            }
            if (confirm(`确定要删除模板 “${name}” 吗？`)) {
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
                alert("模板名称和动作列表不能为空！");
                return;
            }
            fitnessTemplates[name] = exercises;
            saveTemplates();
            alert(`模板 “${name}” 已保存！`);
        });

        function initializeFitness() {
            const savedWorkout = JSON.parse(localStorage.getItem('currentWorkoutSession'));
            if (savedWorkout) loadSavedWorkout(savedWorkout);
            populateTemplateSelectors();
            checkShowFinishButton();
        }

        finishWorkoutBtn.addEventListener('click', archiveWorkout);

        workoutSession.addEventListener('input', (e) => {
            if (e.target.classList.contains('input-weight') || e.target.classList.contains('input-reps')) {
                saveCurrentWorkout();
            }
        });

        loadTemplateBtn.addEventListener('click', () => {
            if (templateSelector.value) loadWorkout(templateSelector.value);
        });

        workoutSession.addEventListener('click', function (e) {
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
                        if (typeof showEnergyAlert === 'function') {
                            showEnergyAlert('能量补充完毕!', '准备好进行下一组训练！');
                        } else {
                            alert('休息结束，开始下一组！');
                        }
                        btn.textContent = `休息${restTime}s`;
                        btn.disabled = false;
                    }
                }, 1000);
            }
        });

        initializeFitness();
    })();

    // ======== 模块三：训练分析 ========
    const AnalysisModule = (function () {
        const noDataMessage = document.getElementById('no-data-message');
        const chartControls = document.querySelector('.chart-controls');
        const chartDisplayArea = document.getElementById('chart-display-area');
        const chartTypeSelector = document.getElementById('chart-type-selector');
        const exerciseSelector = document.getElementById('exercise-selector');
        const monthSelector = document.getElementById('month-selector');
        const calendarContainer = document.getElementById('calendar-heatmap');

        const mainCtx = document.getElementById('main-chart').getContext('2d');
        const barCtx = document.getElementById('bar-chart').getContext('2d');

        let mainChart = null;
        let barChart = null;

        function showView(viewId) {
            const lineChartContainer = document.getElementById('line-chart-container');
            const barChartContainer = document.getElementById('bar-chart-container');
            [lineChartContainer, barChartContainer, calendarContainer].forEach(v => v.style.display = 'none');
            const target = document.getElementById(viewId);
            if (target) target.style.display = 'block';
        }

        function calculateE1RM(weight, reps) {
            if (reps <= 0 || weight <= 0) return 0;
            if (reps === 1) return weight;
            return weight * (1 + reps / 30);
        }

        function drawChart(ctx, chartInstance, type, labels, label, data) {
            if (chartInstance) chartInstance.destroy();
            return new Chart(ctx, {
                type,
                data: {
                    labels,
                    datasets: [{
                        label,
                        data,
                        backgroundColor: 'rgba(217, 95, 67, 0.5)',
                        borderColor: 'rgba(217, 95, 67, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        function drawMultiLineChart(ctx, chartInstance, labels, exName, volData, e1rmData) {
            if (chartInstance) chartInstance.destroy();
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: `${exName} 容量 (kg)`,
                        data: volData,
                        yAxisID: 'yVolume',
                        borderColor: 'rgba(217, 95, 67, 1)',
                        backgroundColor: 'rgba(217, 95, 67, 0.2)'
                    }, {
                        label: `${exName} 预估1RM (kg)`,
                        data: e1rmData,
                        yAxisID: 'yE1RM',
                        borderColor: 'rgba(124, 140, 124, 1)',
                        backgroundColor: 'rgba(124, 140, 124, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        yVolume: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: '容量 (kg)' }
                        },
                        yE1RM: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: '预估1RM (kg)' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        }

        function renderTotalVolumeChart() {
            showView('line-chart-container');
            exerciseSelector.style.display = 'none';
            const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            const labels = history.map(r => r.date);
            const data = history.map(r => r.workout.reduce((t, ex) => t + ex.sets.reduce((v, set) => v + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0));
            mainChart = drawChart(mainCtx, mainChart, 'line', labels, '训练总容量 (kg)', data);
        }

        function renderLatestWorkoutChart() {
            showView('bar-chart-container');
            exerciseSelector.style.display = 'none';
            const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            if (history.length === 0) return;
            const latestWorkout = history[history.length - 1].workout;
            const labels = latestWorkout.map(ex => ex.header.split(' (')[0]);
            const data = latestWorkout.map(ex => ex.sets.reduce((acc, set) => acc + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0));
            barChart = drawChart(barCtx, barChart, 'bar', labels, `最近训练容量 (${history[history.length - 1].date})`, data);
        }

        function renderExerciseProgressChart() {
            showView('line-chart-container');
            exerciseSelector.style.display = 'block';
            const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            const exerciseName = exerciseSelector.value;
            if (!exerciseName) {
                if (mainChart) mainChart.destroy();
                mainChart = null;
                return;
            }
            const labels = [];
            const volumeData = [];
            const e1rmData = [];
            history.forEach(r => {
                const targetExercise = r.workout.find(ex => ex.header.split(' (')[0] === exerciseName);
                if (targetExercise) {
                    labels.push(r.date);
                    let totalVol = 0;
                    let maxE1RM = 0;
                    targetExercise.sets.forEach(set => {
                        const w = parseFloat(set.weight) || 0;
                        const reps = parseInt(set.reps) || 0;
                        totalVol += w * reps;
                        maxE1RM = Math.max(maxE1RM, calculateE1RM(w, reps));
                    });
                    volumeData.push(totalVol);
                    e1rmData.push(maxE1RM.toFixed(1));
                }
            });
            mainChart = drawMultiLineChart(mainCtx, mainChart, labels, exerciseName, volumeData, e1rmData);
        }

        function renderCalendar() {
            showView('calendar-heatmap');
            exerciseSelector.style.display = 'none';

            calendarContainer.innerHTML = ''; // 清空

            const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            if (history.length === 0) return;

            // 汇总日期对应容量
            const dataByDate = {};
            history.forEach(r => {
                const vol = r.workout.reduce((acc, ex) =>
                    acc + ex.sets.reduce((v, set) => v + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0);
                if (vol > 0) dataByDate[r.date] = vol;
            });

            const months = [...new Set(Object.keys(dataByDate).map(date => date.slice(0, 7)))].sort();

            // 填充月份选择器（如果存在）
            if (monthSelector) {
                if (!monthSelector.innerHTML || monthSelector.childElementCount !== months.length + 1) {
                    monthSelector.innerHTML = `<option value="all">全部</option>`;
                    months.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m;
                        opt.textContent = m.replace('-', '年') + '月';
                        monthSelector.appendChild(opt);
                    });
                }
                monthSelector.style.display = 'inline-block';
            }

            const selectedMonth = monthSelector && monthSelector.value !== "all" ? monthSelector.value : null;
            const monthsToShow = selectedMonth ? [selectedMonth] : months;

            monthsToShow.forEach(month => {
                const title = document.createElement('div');
                title.style.margin = '12px 0 4px';
                title.style.fontWeight = 'bold';
                title.textContent = `${month.replace('-', '年')}月`;
                calendarContainer.appendChild(title);

                const weekdayRow = document.createElement('div');
                weekdayRow.className = 'calendar-weekdays';
                ['日', '一', '二', '三', '四', '五', '六'].forEach(wd => {
                    const div = document.createElement('div');
                    div.textContent = wd;
                    weekdayRow.appendChild(div);
                });
                calendarContainer.appendChild(weekdayRow);

                const monthGrid = document.createElement('div');
                monthGrid.className = 'calendar-grid';

                const [year, mon] = month.split('-').map(Number);
                const firstDay = new Date(year, mon - 1, 1);
                const daysCount = new Date(year, mon, 0).getDate();

                for (let i = 0; i < firstDay.getDay(); i++) {
                    monthGrid.appendChild(document.createElement('div'));
                }

                let maxVol = 0;
                for (let d = 1; d <= daysCount; d++) {
                    const dt = `${month}-${d.toString().padStart(2, '0')}`;
                    if (dataByDate[dt] && dataByDate[dt] > maxVol) maxVol = dataByDate[dt];
                }

                for (let d = 1; d <= daysCount; d++) {
                    const dt = `${month}-${d.toString().padStart(2, '0')}`;
                    const cell = document.createElement('div');
                    cell.classList.add('day');
                    if (dataByDate[dt]) {
                        let level = 1;
                        if (maxVol > 0) {
                            level = Math.ceil((dataByDate[dt] / maxVol) * 4) + 1;
                            level = Math.min(level, 5);
                            cell.title = `${dt}: ${dataByDate[dt].toFixed(0)} kg`;
                        }
                        cell.dataset.level = level;
                    }
                    monthGrid.appendChild(cell);
                }

                calendarContainer.appendChild(monthGrid);
            });
        }

        function init() {
            const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
            if (history.length === 0) {
                noDataMessage.style.display = 'block';
                chartControls.style.display = 'none';
                chartDisplayArea.style.display = 'none';
                if (monthSelector) monthSelector.style.display = 'none';
                return;
            }
            noDataMessage.style.display = 'none';
            chartControls.style.display = 'flex';
            chartDisplayArea.style.display = 'block';
            if (monthSelector) monthSelector.style.display = 'none';

            const allExercises = [...new Set(history.flatMap(r => r.workout.map(ex => ex.header.split(' (')[0])))];
            const currentSelection = exerciseSelector.value;
            exerciseSelector.innerHTML = '<option value="">--选择动作--</option>';
            allExercises.forEach(ex => exerciseSelector.add(new Option(ex, ex)));
            exerciseSelector.value = currentSelection;

            updateChart();
        }

        function updateChart() {
            const chartType = chartTypeSelector.value;
            if (chartType === 'totalVolume') {
                if (monthSelector) monthSelector.style.display = 'none';
                renderTotalVolumeChart();
            } else if (chartType === 'exerciseProgress') {
                if (monthSelector) monthSelector.style.display = 'none';
                renderExerciseProgressChart();
            } else if (chartType === 'latestWorkout') {
                if (monthSelector) monthSelector.style.display = 'none';
                renderLatestWorkoutChart();
            } else if (chartType === 'calendar') {
                if (monthSelector) monthSelector.style.display = 'inline-block';
                renderCalendar();
            }
        }

        chartTypeSelector.addEventListener('change', updateChart);
        exerciseSelector.addEventListener('change', renderExerciseProgressChart);
        if (monthSelector) monthSelector.addEventListener('change', renderCalendar);

        return { init };
    })();

    // 默认显示日常待办页面
    switchView('daily');
});

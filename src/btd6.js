import { crosspathData } from './btd6-data.js';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const monkeyGrid = document.getElementById('monkey-grid');
    const filterContainer = document.getElementById('filter-container');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');

    // Use FontAwesome icons instead of images for Camo/Lead to match the new theme
    const camoIcon = `<i class="fas fa-eye text-green-500" title="Can pop Camo Bloons"></i>`;
    const leadIcon = `<i class="fas fa-layer-group text-gray-500" title="Can pop Lead Bloons"></i>`;

    const getIcon = (canPop, iconHtml) => canPop === true ? iconHtml : canPop === false ? `<span class="opacity-20 grayscale">${iconHtml}</span>` : '';

    const renderMonkeys = () => {
        const filter = filterContainer.querySelector('.active').dataset.type;
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        monkeyGrid.innerHTML = '';

        let filteredMonkeys = crosspathData.monkeys
            .filter(monkey => filter === 'all' || monkey.type === filter)
            .filter(monkey => {
                const monkeyNameMatch = monkey.name.toLowerCase().includes(searchTerm);
                const upgradeNameMatch = monkey.upgrades.some(up => up.name.toLowerCase().includes(searchTerm));
                return monkeyNameMatch || upgradeNameMatch;
            });

        if (sortBy === 'name') {
            filteredMonkeys.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'rank') {
            filteredMonkeys.sort((a, b) => {
                const minRankA = Math.min(...a.upgrades.map(u => u.rank));
                const minRankB = Math.min(...b.upgrades.map(u => u.rank));
                return minRankA - minRankB;
            });
        } else if (sortBy === 'type') {
            filteredMonkeys.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        }

        if (filteredMonkeys.length === 0) {
            monkeyGrid.innerHTML = `<p class="text-slate-500 dark:text-slate-400 italic col-span-full text-center py-10">No monkeys found. Try a different search or filter.</p>`;
            return;
        }

        filteredMonkeys.forEach(monkey => {
            const card = document.createElement('div');
            // Glassmorphism card style
            card.className = `card group bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-lg rounded-2xl border border-white/20 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden`;

            // Type border color mapping
            const typeColors = {
                'Primary': 'border-blue-500',
                'Military': 'border-green-600',
                'Magic': 'border-purple-500',
                'Support': 'border-orange-500'
            };
            card.classList.add('border-l-4', typeColors[monkey.type] || 'border-gray-500');

            const sortedUpgrades = [...monkey.upgrades].sort((a, b) => a.rank - b.rank);

            card.innerHTML = `
                <div class="p-6 cursor-pointer header select-none">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-4">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-accent transition-colors">${monkey.name}</h3>
                            <div class="flex gap-2 text-lg">
                                ${getIcon(monkey.defaultCamo, camoIcon)}
                                ${getIcon(monkey.defaultLead, leadIcon)}
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">${monkey.type}</span>
                            <span class="chevron text-slate-400 transition-transform duration-300">
                                <i class="fas fa-chevron-down"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="details px-6 bg-slate-50/50 dark:bg-slate-900/30 max-h-0 overflow-hidden transition-all duration-500 ease-in-out">
                    ${sortedUpgrades.map(upgrade => `
                        <div class="py-5 border-t border-slate-200 dark:border-slate-700 first:border-t-0">
                            <div class="flex items-start gap-5">
                                <div class="text-4xl font-black text-slate-200 dark:text-slate-700 w-12 text-center select-none">#${upgrade.rank}</div>
                                <div class="flex-1">
                                    <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
                                        <div>
                                            <h4 class="text-lg font-bold text-accent">${upgrade.name}</h4>
                                            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Best Crosspath</p>
                                        </div>
                                        <div class="flex items-center gap-1 text-base font-bold text-white bg-slate-800 dark:bg-slate-950 p-1.5 rounded-lg shadow-inner">
                                            ${upgrade.crosspath.split('-').map((p, i) => `<span class="w-7 h-7 flex items-center justify-center rounded ${['bg-red-500', 'bg-blue-500', 'bg-green-500'][i]}">${p}</span>`).join('')}
                                        </div>
                                    </div>
                                    <div class="flex items-center mb-3 gap-2 text-sm">
                                        ${getIcon(upgrade.canPopCamo, camoIcon)}
                                        ${getIcon(upgrade.canPopLead, leadIcon)}
                                    </div>
                                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${upgrade.notes || ''}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    <div class="pb-4"></div> 
                </div>
            `;
            monkeyGrid.appendChild(card);
        });

        document.querySelectorAll('.card .header').forEach(header => {
            header.addEventListener('click', () => {
                const details = header.nextElementSibling;
                const chevron = header.querySelector('.chevron');

                if (details.style.maxHeight) {
                    details.style.maxHeight = null;
                    chevron.style.transform = 'rotate(0deg)';
                } else {
                    details.style.maxHeight = details.scrollHeight + "px";
                    chevron.style.transform = 'rotate(180deg)';
                }
            });
        });
    };

    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        }
    };

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light'); // Sync with main site theme
        applyTheme(isDark);
    });

    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterContainer.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active', 'bg-accent', 'text-white', 'shadow-md');
                btn.classList.add('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-200', 'dark:hover:bg-slate-700');
            });
            e.target.classList.add('active', 'bg-accent', 'text-white', 'shadow-md');
            e.target.classList.remove('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-200', 'dark:hover:bg-slate-700');
            renderMonkeys();
        }
    });

    searchInput.addEventListener('input', renderMonkeys);
    sortSelect.addEventListener('change', renderMonkeys);

    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));

    renderMonkeys();

    // Style active button on load
    const activeButton = filterContainer.querySelector('.active');
    activeButton.classList.add('bg-accent', 'text-white', 'shadow-md');
    activeButton.classList.remove('text-slate-600', 'dark:text-slate-400');
});

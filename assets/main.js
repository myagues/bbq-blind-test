async function fetchMapping() {
  const res = await fetch('assets/mapping.json');
  if (!res.ok) throw new Error('Failed to load mapping.json');
  return res.json();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createListItem(text, id) {
  const li = document.createElement('li');
  li.className = 'item flex min-h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-base focus:outline-teal-700 focus:outline-offset-1';
  li.tabIndex = 0;
  li.dataset.id = id;
  li.textContent = text;
  return li;
}

function renderEnvironments(envs) {
  const envList = document.getElementById('environments');
  envList.innerHTML = '';
  envs.forEach((env) => {
    const li = document.createElement('li');
    li.className = 'item env-item flex min-h-14 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 font-bold text-base text-amber-900';
    li.textContent = env;
    envList.appendChild(li);
  });
}

function renderAnimals(items) {
  const animals = document.getElementById('animals');
  animals.innerHTML = '';
  items.forEach((it) => animals.appendChild(createListItem(it.animal, it.id)));
}

let sortableInstance = null;

function initSortable() {
  const list = document.getElementById('animals');
  // Destroy previous instance if it exists
  if (sortableInstance) {
    sortableInstance.destroy();
  }
  sortableInstance = Sortable.create(list, {
    animation: 150,
    ghostClass: 'ghost',
    swapThreshold: 0.7,
  });
}

function getCurrentAnimalsOrder() {
  const animals = Array.from(document.getElementById('animals').children);
  return animals.map(li => li.textContent.trim());
}

// removed per-item marking — score only

async function main() {
  try {
    const mapping = await fetchMapping();
    // environments in desired fixed order
    const environments = mapping.map(m => m.correctEnvironment);
    renderEnvironments(environments);

    // prepare animals list (shuffled)
    const animalsData = mapping.map(m => ({ id: m.id, animal: m.animal, correctEnvironment: m.correctEnvironment }));
    shuffle(animalsData);
    renderAnimals(animalsData);

    initSortable();

    document.getElementById('shuffleBtn').addEventListener('click', () => {
      shuffle(animalsData);
      renderAnimals(animalsData);
      initSortable();
      document.getElementById('result').className = 'text-center font-bold text-large text-white';
      document.getElementById('result').textContent = '??';
    });

    document.getElementById('checkBtn').addEventListener('click', () => {
      const current = getCurrentAnimalsOrder();
      // compare each position and count correct
      let correctCount = 0;
      current.forEach((animalName, idx) => {
        const envName = environments[idx];
        const entry = mapping.find(m => m.animal === animalName);
        if (entry && entry.correctEnvironment === envName) correctCount++;
      });
      const resultEl = document.getElementById('result');
      resultEl.textContent = `${correctCount} / ${mapping.length} correct`;
      resultEl.className = 'text-center font-bold text-large text-teal-700';
    });

  } catch (err) {
    console.error(err);
    document.getElementById('result').textContent = 'Error loading data';
  }
}

document.addEventListener('DOMContentLoaded', main);

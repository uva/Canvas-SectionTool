let sections = [];
fetch(`/api/v1/courses/${ENV.course_id}/sections`).then(c => c.json()).then(c => {
    sections = c;
    const sectionFilter = $(`<select>
      <option>Show all sections</option>
      ${sections.map(s => `<option value=${s.id}>${s.name}</option>`)}
    </select>`)[0];
    $('div.header-bar').append(sectionFilter);

    function updateModules() {
        const modules = document.querySelectorAll('div.context_module');
        for (const mod of modules) {
            const name = mod.attributes["aria-label"].value;
            if (!name) continue;
            mod.style.display = sectionFilter.selectedIndex === 0
                || !name.includes(' | ')
                || name.includes(sections[sectionFilter.selectedIndex - 1].name + " | ")
                    ? 'block' : 'none';
        }
    }

    sectionFilter.addEventListener('change', updateModules);

    fetch(`/api/v1/courses/${ENV.course_id}/enrollments?user_id=${ENV.current_user_id}`)
        .then(c => c.json())
        .then(c => {
           const secId = c[0].course_section_id;
           const index = sections.findIndex(s => s.id === secId);
           if (index >= 0) {
               sectionFilter.selectedIndex = index + 1;
               updateModules();
           }
        });
});

let sectionSelect = null;

const links = document.querySelectorAll('.edit_module_link,.add_module_link');
for (const link of links) {
    link.addEventListener('click', () => {
        const nameBox = document.querySelector('#context_module_name');
        if (!sectionSelect) {
            sectionSelect = $(`<select>
              <option>All sections</option>
              ${sections.map(s => `<option value=${s.id}>${s.name}</option>`)}
            </select>`)[0];
            $('div.module_name')
                .append(`<div style='margin-top: 10px'><label>Section:</label> </div>`)
                .append(sectionSelect);

            sectionSelect.addEventListener('change', () => {
                const part = nameBox.value.includes(' | ') ? nameBox.value.split(' | ').slice(1).join(' | ').trim() : nameBox.value;
                nameBox.value = sectionSelect.selectedIndex === 0 ? part : `${sections[sectionSelect.selectedIndex - 1].name} | ${part}`;
            });
        }

        setTimeout(() => {
            sectionSelect.selectedIndex = 0;
            if (nameBox.value.includes(' | ')) {
                const current = nameBox.value.split(' | ')[0];
                const section = sections.findIndex(z => z.name === current);
                if (section >= 0) {
                    sectionSelect.selectedIndex = section + 1;
                }
            }
        }, 10);
    })
}
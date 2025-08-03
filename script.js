async function loadThemesFromGoogleSheet() {
  const sheetId = config.sheetId;
  const apiKey = config.apiKey;

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=Август%2025&majorDimension=ROWS&key=${apiKey}`
    );
    const data = await response.json();
    const sheetValues = data.valueRanges?.[0]?.values || [];

    const venueMap = {
      "ЧП": "Чешская Пивница",
      "LOFT": "ЛОФТ",
      "ВБ": "ВарБар",
      "МАЯК": "МАЯК",
      "НРБ": "На районе бар",
      "ДК": "ДК им. Кирова"
    }; 

    const today = new Date();
    const themes = sheetValues
      .slice(2)
      .filter(row => {
        const date = row[2];
        if (!date) return false;
        const [day, month, year] = date.split('.').map(Number);
        const gameDate = new Date(year, month - 1, day);
        return gameDate >= today;
      })
      .map(row => {
        const date = row[2];
        const dayOfWeek = row[3];
        const time = row[4];
        const shortVenue = row[5];
        const fullVenue = venueMap[shortVenue] || shortVenue;
        const title = row[6];
        const price = row[9];
        return {
          label: `${title} — ${date}, ${time}, ${fullVenue}`,
          price
        };
      });

    const select = document.getElementById("theme");
    const priceInput = document.getElementById("price");

    select.innerHTML = "";

    if (themes.length === 0) {
      const option = new Option("Нет доступных игр", "");
      select.add(option);
      return;
    }

    for (const theme of themes) {
      const option = new Option(theme.label, theme.label);
      option.setAttribute("data-price", theme.price);
      select.add(option);
    }

    select.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0];
      const price = selectedOption?.getAttribute("data-price") || 0;
      priceInput.value = price;
      document.getElementById("total").textContent = price;
    });

    priceInput.value = themes[0].price;
    document.getElementById("total").textContent = themes[0].price;

  } catch (error) {
    console.error("Ошибка загрузки тем:", error);
    const select = document.getElementById("theme");
    select.innerHTML = "";
    select.add(new Option("Не удалось загрузить тематики", ""));
  }
}

loadThemesFromGoogleSheet();
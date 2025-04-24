const theme = {
    light: {
        background: "#f4edec",
        backgroundSecondary: "#FBF8F8",
        textColor: '#000000',
        textColorSecondary: "#000000",
        border: "#c5c5c5",
        border2: "#9B9B9B",
        description: "#eeeeee",
        // description2: "#f5f5f5",
        movieTitle: "#580000",
        searchBar: "#ffffff",
        headerColor: "#f5f5f5",
        shadowColor: "#000000",
        shadowColor: "#000000",
        gridItemColor: "#FFFFFF", // general cards  
        swiperBackground: '#f5f5f5',
        editBtn: "#d8d8d8",
        seenBtn: "#8EE357",
        watchlistBtn: "#B2B2B2",
        submitBtn: "#A44443",
        submitBtnBorder: "#801616",
    },
    dark: {
        background: "#151515",
        backgroundSecondary: "#202020",
        textColor: '#FFFFFF',
        textColorSecondary: "#e5e5e5",
        border: "#898989",
        border2: "#6b6b6b",
        description: "#555555",
        // description2: "#373737",
        movieTitle: "#f4edec",
        searchBar: "#ededed",
        headerColor: "#000000",
        shadowColor: "#000000",
        shadowColor2: "#999999",
        gridItemColor: "#444444", // general cards
        swiperBackground: '#171717',
        editBtn: "#888888",
        seenBtn: "#57CB32",
        watchlistBtn: "#969696",
        submitBtn: "#A44443",
        submitBtnBorder: "#A44443",
    }
};

export const getNavColorHex = (navColorMode) => {
    return navColorMode === 'red' ? '#a44443' : 'black';
};

export default theme;


// SALMON COLOR ON THE LOGO IS FFD4D4
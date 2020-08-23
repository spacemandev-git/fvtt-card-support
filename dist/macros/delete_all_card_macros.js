let mCards = game.macros.filter(macro => macro.getFlag("world","cardID") );
for (let m of mCards) m.delete();
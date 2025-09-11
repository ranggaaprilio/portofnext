import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { List, Card, Image, Spin, Typography, Layout, Row, Col } from 'antd';
import 'antd/dist/reset.css';

const { Title } = Typography;
const { Header, Content } = Layout;

// Async thunk for fetching Pokemon data
const fetchPokemon = createAsyncThunk(
  'pokemon/fetchPokemon',
  async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
      const pokemonList = response.data.results;
      
      const pokemonWithDetails = await Promise.all(
        pokemonList.map(async (pokemon) => {
          const detailResponse = await axios.get(pokemon.url);
          return {
            id: detailResponse.data.id,
            name: detailResponse.data.name,
            image: detailResponse.data.sprites.front_default,
            height: detailResponse.data.height,
            weight: detailResponse.data.weight,
            types: detailResponse.data.types.map(type => type.type.name)
          };
        })
      );
      
      return pokemonWithDetails;
    } catch (error) {
      // Fallback data when API is not accessible
      return [
        {
          id: 1,
          name: 'bulbasaur',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          height: 7,
          weight: 69,
          types: ['grass', 'poison']
        },
        {
          id: 4,
          name: 'charmander',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
          height: 6,
          weight: 85,
          types: ['fire']
        },
        {
          id: 7,
          name: 'squirtle',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
          height: 5,
          weight: 90,
          types: ['water']
        },
        {
          id: 25,
          name: 'pikachu',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          height: 4,
          weight: 60,
          types: ['electric']
        },
        {
          id: 150,
          name: 'mewtwo',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
          height: 20,
          weight: 1220,
          types: ['psychic']
        },
        {
          id: 151,
          name: 'mew',
          image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
          height: 4,
          weight: 40,
          types: ['psychic']
        }
      ];
    }
  }
);

// Pokemon slice
const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: {
    pokemon: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPokemon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = action.payload;
      })
      .addCase(fetchPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// Store
const store = configureStore({
  reducer: {
    pokemon: pokemonSlice.reducer
  }
});

// Pokemon component
const PokemonApp = () => {
  const dispatch = useDispatch();
  const { pokemon, loading, error } = useSelector(state => state.pokemon);

  useEffect(() => {
    dispatch(fetchPokemon());
  }, [dispatch]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ background: '#1890ff', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Pokemon App
          </Title>
        </Header>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading Pokemon...</div>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ background: '#1890ff', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Pokemon App
          </Title>
        </Header>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <div>Error: {error}</div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#1890ff', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          Pokemon App
        </Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          {pokemon.map((poke) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={poke.id}>
              <Card
                hoverable
                cover={
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Image
                      alt={poke.name}
                      src={poke.image}
                      style={{ width: 96, height: 96 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  </div>
                }
                style={{ height: '100%' }}
              >
                <Card.Meta
                  title={
                    <Title level={4} style={{ textTransform: 'capitalize', margin: 0 }}>
                      {poke.name}
                    </Title>
                  }
                  description={
                    <div>
                      <div><strong>ID:</strong> #{poke.id}</div>
                      <div><strong>Height:</strong> {poke.height / 10} m</div>
                      <div><strong>Weight:</strong> {poke.weight / 10} kg</div>
                      <div><strong>Types:</strong> {poke.types.join(', ')}</div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

// App wrapper
const App = () => {
  return (
    <Provider store={store}>
      <PokemonApp />
    </Provider>
  );
};

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
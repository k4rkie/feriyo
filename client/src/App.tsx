import { Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import CreateListing from "./pages/CreateListing";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Landing from "./pages/Landing";
import UserProfile from "./pages/UserProfile";
import EditListing from "./pages/EditListing";
import MyListings from "./pages/MyListings";

function App() {
  return (
    <>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#111111",
              color: "#fff",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route path="listings" element={<Listings />} />
            <Route path="listings/create" element={<CreateListing />} />
            <Route path="listings/edit/:listingId" element={<EditListing />} />
            <Route path="listings/:listingId" element={<ListingDetail />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="my-listings" element={<MyListings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;

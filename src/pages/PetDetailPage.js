// src/pages/PetDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getPetListingDetails } from '../services/petService';
import { getOrCreateChat } from '../services/chatService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

import LoadingSpinner from '../components/Common/LoadingSpinner';
import ChatModal from '../components/Chat/ChatModal';

import './PetDetailPage.css';

const PetDetailPage = () => {
  const { petId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentUserData, loading: authLoading } = useAuth();

  const [pet, setPet] = useState(null);
  // Seller state will hold: { uid?: string, name: string, email?: string, role: string, error?: string }
  // The error field can help distinguish why seller info is a fallback.
  const [seller, setSeller] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentChatData, setCurrentChatData] = useState(null);
  const [chatButtonError, setChatButtonError] = useState('');
  const [chatButtonLoading, setChatButtonLoading] = useState(false);

  useEffect(() => {
    console.log("[PetDetail] useEffect triggered. petId:", petId, "authLoading:", authLoading);
    const fetchPetAndSellerDetails = async () => {
      if (!petId || typeof petId !== 'string' || !petId.trim()) {
        setPageError("Invalid or missing Pet ID in URL.");
        setPageLoading(false);
        console.error("[PetDetail] Invalid Pet ID.");
        return;
      }

      setPageLoading(true);
      setPageError('');
      setPet(null);
      setSeller(null); // Reset seller on each new fetch

      try {
        console.log(`[PetDetail] Fetching pet details for petId: ${petId}`);
        const petData = await getPetListingDetails(petId);

        if (!petData) {
          setPageError('Pet not found. It might have been removed or the ID is incorrect.');
          setPageLoading(false);
          console.warn(`[PetDetail] Pet data not found for petId: ${petId}`);
          return;
        }
        setPet(petData);
        console.log("[PetDetail] Pet data fetched:", petData);

        // Now fetch seller details if petData and sellerId are valid
        if (petData.sellerId && typeof petData.sellerId === 'string' && petData.sellerId.trim()) {
          console.log(`[PetDetail] Pet has sellerId: ${petData.sellerId}. Fetching seller details...`);
          try {
            const sellerDocRef = doc(db, "users", petData.sellerId);
            const sellerDocSnap = await getDoc(sellerDocRef);

            if (sellerDocSnap.exists()) {
              const sellerDbData = sellerDocSnap.data();
              console.log("[PetDetail] Seller document found:", sellerDbData);
              setSeller({
                uid: sellerDocSnap.id,
                name: String(sellerDbData.name || `Seller (ID: ${sellerDocSnap.id.substring(0, 6)})`), // Ensure name is a string
                email: sellerDbData.email, // Optional
                role: String(sellerDbData.role || 'Seller') // Ensure role is a string
              });
            } else {
              console.warn(`[PetDetail] Seller document NOT FOUND for sellerId: ${petData.sellerId}. This pet listing might be orphaned.`);
              setSeller({
                uid: petData.sellerId, // Keep the UID from pet if available
                name: "Seller Account Not Found",
                role: 'Unknown',
                error: "Seller account associated with this pet could not be found."
              });
            }
          } catch (sellerFetchError) {
            console.error("[PetDetail] Error occurred while fetching seller details from Firestore:", sellerFetchError);
            setSeller({
              uid: petData.sellerId, // Keep the UID from pet if available
              name: "Could not load seller information",
              role: 'Unknown',
              error: `Error fetching seller: ${sellerFetchError.message}`
            });
          }
        } else {
          console.warn("[PetDetail] Pet listing is missing a valid sellerId or sellerId is not a string.", petData);
          setSeller({
            name: "Seller Not Specified for this Pet",
            role: 'Unknown',
            error: "Pet listing does not have a valid seller ID."
            // No seller.uid here as petData.sellerId is invalid/missing
          });
        }
      } catch (err) {
        console.error("[PetDetail] Error fetching pet details (main try/catch):", err);
        setPageError(`Failed to load pet information: ${err.message || 'An unknown error occurred'}`);
      } finally {
        setPageLoading(false);
        console.log("[PetDetail] Fetching process finished.");
      }
    };

    if (!authLoading) { // Only proceed if authentication state is resolved
      fetchPetAndSellerDetails();
    } else {
      console.log("[PetDetail] Authentication is still loading. Delaying pet/seller data fetch.");
    }
  }, [petId, authLoading]); // Depend on petId and authLoading

  const handleContactSeller = async () => {
    console.log("[PetDetail] handleContactSeller initiated.");
    setChatButtonError('');
    setChatButtonLoading(true);

    if (!currentUser || !currentUserData || typeof currentUserData.uid !== 'string' || !currentUserData.uid.trim()) {
      setChatButtonError("Please log in to contact the seller.");
      setChatButtonLoading(false);
      // navigate('/login', { state: { from: location } }); // Consider this redirect
      return;
    }

    // CRITICAL CHECK: Ensure seller object and its uid are valid strings
    if (!seller || typeof seller.uid !== 'string' || !seller.uid.trim()) {
      console.error("[PetDetail] Attempted to chat but seller.uid is invalid or missing.", seller);
      setChatButtonError("Seller information is incomplete or invalid, cannot initiate chat.");
      setChatButtonLoading(false);
      return;
    }

    if (seller.uid === currentUser.uid) {
      setChatButtonError("You cannot start a chat with yourself.");
      setChatButtonLoading(false);
      return;
    }

    // Prepare user info for chatService, ensuring all parts are strings
    const localUserInfo = {
      uid: currentUserData.uid, // Already a string from Firebase Auth
      name: String(currentUserData.name || currentUserData.email?.split('@')[0] || `User ${currentUserData.uid.substring(0, 6)}`),
      role: String(currentUserData.role || 'Buyer')
    };

    const remoteUserInfo = {
      uid: seller.uid, // Already a string from setSeller logic
      name: String(seller.name), // Already a string with fallback from setSeller
      role: String(seller.role)  // Already a string with fallback from setSeller
    };
    
    console.log("[PetDetail] Data for getOrCreateChat - localUserInfo:", JSON.stringify(localUserInfo));
    console.log("[PetDetail] Data for getOrCreateChat - remoteUserInfo:", JSON.stringify(remoteUserInfo));

    try {
      const chat = await getOrCreateChat(localUserInfo, remoteUserInfo);
      setCurrentChatData(chat);
      setIsChatModalOpen(true);
    } catch (err) {
      console.error("[PetDetail] Error received from getOrCreateChat service:", err);
      setChatButtonError(err.message || "Could not start chat. Please try again later.");
    } finally {
      setChatButtonLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="page-container loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)'}}>
        <LoadingSpinner />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="page-container pet-detail-page error-page-display">
        <p className="error-message">{pageError}</p>
        <Link to="/pets" className="btn btn-primary">Back to Search</Link>
      </div>
    );
  }

  if (!pet) { // Should be caught by pageError earlier if petData was not found
    return (
      <div className="page-container pet-detail-page error-page-display">
        <p>Pet information could not be loaded. It might have been removed or the ID is incorrect.</p>
        <Link to="/pets" className="btn btn-primary">Back to Search</Link>
      </div>
    );
  }

  const defaultImage = 'https://via.placeholder.com/600x400.png?text=No+Image+Available';
  const isCurrentUserTheSeller = currentUser && pet && pet.sellerId === currentUser.uid;
  const canAttemptChat = currentUser && seller && typeof seller.uid === 'string' && seller.uid.trim() && !isCurrentUserTheSeller;


  return (
    <div className="page-container pet-detail-page">
      <Link to="/pets" className="back-link">← Back to Pet Search</Link>
      <div className="pet-detail-content">
        <div className="pet-image-container">
          <img
            src={pet.imageUrl || defaultImage}
            alt={pet.name || 'Pet Image'}
            className="pet-detail-image"
            onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
          />
        </div>
        <div className="pet-info-container">
          <h1>{pet.name || 'Unnamed Pet'}</h1>
          <p><strong>Type:</strong> {pet.type || 'N/A'}</p>
          <p><strong>Breed:</strong> {pet.breed || 'N/A'}</p>
          <p><strong>Age:</strong> {pet.age ? `${pet.age} year(s)` : 'N/A'}</p>
          <p><strong>Status:</strong> <span className={`status-${pet.status || 'unknown'}`}>{pet.status || 'Unknown'}</span></p>
          <div className="pet-description">
            <h3>About {pet.name || 'this pet'}:</h3>
            <p>{pet.description || 'No description provided.'}</p>
          </div>

          <div className="seller-info">
            <h3>Seller Information:</h3>
            <p>
              <strong>Listed by:</strong> {seller?.name || (pet?.sellerId ? "Loading seller details..." : "Seller Not Specified")}
            </p>
            {seller?.error && <p className="error-message info-text">{seller.error}</p>}


            {canAttemptChat && (
              <>
                <button 
                  onClick={handleContactSeller} 
                  className="contact-seller-button"
                  disabled={chatButtonLoading}
                >
                  {chatButtonLoading ? 'Preparing Chat...' : 'Chat with Seller'}
                </button>
                {chatButtonError && <p className="error-message chat-button-error">{chatButtonError}</p>}
              </>
            )}

            {isCurrentUserTheSeller && (<p className="info-text"><em>This is your listing.</em></p>)}
            
            {!currentUser && (pet && pet.sellerId) && ( // Show login prompt only if there's a sellerId on the pet
                 <p className="info-text">
                   <em><Link to="/login" state={{ from: location }}>Login</Link> to contact the seller.</em>
                 </p>
            )}
          </div>
        </div>
      </div>

      {isChatModalOpen && currentChatData && seller && typeof seller.name === 'string' && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          chatData={currentChatData}
          otherUserName={seller.name} // seller.name is now guaranteed to be a string by setSeller
        />
      )}
    </div>
  );
};

export default PetDetailPage;